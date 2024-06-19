import os
import pandas as pd
import uuid
from db.category_handler import create_categories, remove_image_folder, add_image_folder

imageInfoName = './db/database/imageInfo.csv'
circleRegionInfo = './db/database/circleRegionInfo.csv'
boxRegionInfo = './db/database/boxRegionInfo.csv'
polygonInfo = './db/database/polygonInfo.csv'

def generateUid(id):
    uid = uuid.uuid1() if(id == None) else id
    return uid

class Module:
    def __init__(self):
        self.imagesInfo = pd.DataFrame(
            columns=['image-name', 'selected-classes', 'comment', 'image-original-height', 'image-original-width', 'image-src', 'processed']
        )
        self.imageCircleRegions = pd.DataFrame(
            columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'rx', 'ry', 'rw', 'rh']
        )
        self.imageBoxRegions = pd.DataFrame(
            columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'x', 'y', 'w', 'h']
        )
        self.imagePolygonRegions = pd.DataFrame(
            columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'points']
        )

        self.readDataFromDatabase()
        pass

    def readDataFromDatabase(self):
        global imageInfoName, circleRegionInfo, boxRegionInfo, polygonInfo

        self.checkFilesExistence(((imageInfoName, self.imagesInfo), (circleRegionInfo, self.imageCircleRegions), (boxRegionInfo, self.imageBoxRegions), (polygonInfo, self.imagePolygonRegions)))
        self.imagesInfo           = pd.read_csv(imageInfoName)
        self.imageCircleRegions  = pd.read_csv(circleRegionInfo)
        self.imageBoxRegions     = pd.read_csv(boxRegionInfo)
        self.imagePolygonRegions = pd.read_csv(polygonInfo)

    def checkFilesExistence(self, *args):
        global imageInfoName, circleRegionInfo, boxRegionInfo, polygonInfo
        for arguman in args[0]:
            if not os.path.exists(arguman[0]):
                arguman[1].to_csv(arguman[0], index=False)
    
    def saveRegionInfo(self, type, imageSrc, data):
        def regionType(type):
            if type == 'circle':
                return self.circleRegion
            elif type == 'box':
                return self.boxRegion
            elif type == 'polygon':
                return self.polygonRegion
            else:
                return self.otherRegion

        regionData = {}
        regionData['region-id'] = data['id']
        regionData['image-src'] = imageSrc
        regionData['class']     = data['cls']
        regionData['comment']   = data['comment'] if 'comment' in data else ''
        regionData['tags']      = ';'.join(data.get('tags', []))

        regionFunction = regionType(type)
        regionFunction(regionData, data)

        # return regionData

    def saveRegionInDB(self, database, idColumn, uid, data, status): # TODO if region then use one or zero changeSatus, remove in their
        print(f"Database: {database}")
        index = self.findInfoInDb(database, idColumn, uid)

        if index is not None: # set -> diff -> list 
            # Ensure 'selected-classes' is a string before splitting
            print(f"Updating existing data in database: {data}")
            selected_classes_str = data.get('selected-classes', data['class'])
            
            print(f"selected_classes_str: {selected_classes_str}")
            if isinstance(selected_classes_str, list) and len(selected_classes_str) == 1 and isinstance(selected_classes_str[0], str):
                selected_classes_str = selected_classes_str[0]

            if 'selected-classes' in data:
                if ';' in selected_classes_str:
                    old_cat_set = set(database.loc[index, 'selected-classes'].split(';'))
                    # Split the strings to create sets
                    new_cat_set = set(selected_classes_str.split(';'))
                else:
                    old_cat_set = set(database.loc[index, 'selected-classes'])
                    # Split the strings to create sets
                    new_cat_set = set(selected_classes_str)
            else:
                old_cat_set = set(database.loc[index, 'class'])
                # Split the strings to create sets
                new_cat_set = set(selected_classes_str)
            
            for key, value in data.items():
                _value = value[0] if status == 0 else value
                database.at[index, key] = _value
            
            add_, remove_ = get_lists_absolute(new_cat_set, old_cat_set)
            for new_ in add_:
                add_image_folder(new_, data['image-name'][0], data['image-src'][0])
            
            for old_ in remove_:
                remove_image_folder(old_, data['image-name'][0],)

        else: # add whole cat

            if isinstance(data, dict):
                df = pd.DataFrame.from_dict([data])
            else:
                df = pd.DataFrame(data)
            database = pd.concat([database, df], ignore_index=True)
            print(f"Adding new data to database: {data}")
            if 'selected-classes' in data:
                selected_classes = data['selected-classes']

                # Handle the case where selected_classes is a list containing a single string
                if isinstance(selected_classes, list) and len(selected_classes) == 1 and isinstance(selected_classes[0], str):
                    selected_classes = selected_classes[0].split(';')

                for class_ in selected_classes:
                    if class_ != '':
                        print(f"selected class: {class_}")
                        add_image_folder(class_, data['image-name'][0],data['image-src'][0])
            
            # if 'class' in data:
                # for class_ in data['class']:
                    # print(f"class: {class_}")
                    # image_name = os.path.basename(data['image-src'][0])
                    # if class_ != '':
                    #     add_image_folder(class_, image_name,data['image-src'][0])

        return database
    
    def circleRegion(self, regionData, data):
        coords = data['coords']
        regionData['rx'] = [coords['rx']]
        regionData['ry'] = [coords['ry']]
        regionData['rw'] = [coords['rw']]
        regionData['rh'] = [coords['rh']]

        self.imageCircleRegions = self.saveRegionInDB(self.imageCircleRegions, 'region-id', regionData['region-id'], regionData, 1)


    def boxRegion(self, regionData, data):
        coords = data['coords']
        regionData['x'] = [coords['x']]
        regionData['y'] = [coords['y']]
        regionData['w'] = [coords['w']]
        regionData['h'] = [coords['h']]

        self.imageBoxRegions = self.saveRegionInDB(self.imageBoxRegions, 'region-id', regionData['region-id'], regionData, 1)
        

    def polygonRegion(self, regionData, data):
        regionData['points'] = ';'.join(e for e in ['-'.join(str(coord) for coord in point) for point in data['points']])
        self.imagePolygonRegions = self.saveRegionInDB(self.imagePolygonRegions, 'region-id', regionData['region-id'], regionData, 1)
        

    def otherRegion(self, regionData, data):
        print(f"This region type is not defined yet: {data['type']}")
    
    def getImageData(self, data):
        imageData = {}
        imageData['image-name'] = [data['name']]
        imageData['image-src'] = [data['src']]
        imageData['comment'] = [data['comment']]
        imageData['selected-classes'] = [';'.join(data['cls'])]
        pixelSize = data['pixelSize'] if 'pixelSize' in data else {}
        imageData['image-original-height'] = [pixelSize['h']] if pixelSize != {} else []
        imageData['image-original-width'] = [pixelSize['w']] if pixelSize != {} else []
        imageData['processed'] = [1]
        return imageData
    
    def findInfoInDb(self, database, uid_columns, uid):
        idx = database[database[uid_columns] == uid].index.values
        if len(idx) > 0:
            return idx[0]
        
        return None
    
    def findInfoInPolygonDb(self, database, uid_columns, uid):
        regions = database[database[uid_columns] == uid]
        if len(regions) > 0:
            return regions
        
        return None
    
    def findInfoInBoxDb(self, database, uid_columns, uid):
        regions = database[database[uid_columns] == uid]
        if len(regions) > 0:
            return regions
        
        return None
    
    def findInfoInCircleDb(self, database, uid_columns, uid):
        regions = database[database[uid_columns] == uid]
        if len(regions) > 0:
            return regions
        
        return None
    
    def saveDataAutomatically(self, *args):
        for arguman in args[0]:
            arguman[1].to_csv(arguman[0], index=False)

    def handleNewData(self, data):
        try: 
            imageData = self.getImageData(data)
            self.imagesInfo = self.saveRegionInDB(self.imagesInfo, 'image-src', imageData['image-src'][0], imageData, 0)
            
            for region in data['regions']: #TODO: ADD Regions as region for each image -> for deletion process
                self.saveRegionInfo(region['type'], data['src'], region)
            
            print(f"Self.imagesInfo: {self.imagesInfo} and imageInfoName: {imageInfoName}")
            # save data automatically 
            self.saveDataAutomatically(((imageInfoName, self.imagesInfo), (circleRegionInfo, self.imageCircleRegions), (boxRegionInfo, self.imageBoxRegions), (polygonInfo, self.imagePolygonRegions)))
            return True  # Return True if data was successfully handled
        except Exception as e:
            print('Error:', e)
            return False  #
            
    def handleActiveImageData(self, data):
        try:
            imageData = self.getImageData(data)
            self.imagesInfo = self.saveRegionInDB(self.imagesInfo, 'image-src', imageData['image-src'][0], imageData, 0)
            self.imagesInfo.to_csv(imageInfoName, index=False)
            return True  # Return True if data was successfully handled
        except Exception as e:
            print('Error:', e)
            return False  # Return False if an error occurred while handling the data
        
    def createCategories(self, labels):
        if labels is None:
            return
        create_categories(labels)


    def clear_db(self):
        # Clear CSV files
        empty_images_info = pd.DataFrame(columns=['image-name', 'selected-classes', 'comment', 'image-original-height', 'image-original-width', 'image-src', 'processed'])
        empty_circle_regions = pd.DataFrame(columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'rx', 'ry', 'rw', 'rh'])
        empty_box_regions = pd.DataFrame(columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'x', 'y', 'w', 'h'])
        empty_polygon_regions = pd.DataFrame(columns=['region-id', 'image-src', 'class', 'comment', 'tags', 'points'])

        empty_images_info.to_csv(imageInfoName, index=False)
        empty_circle_regions.to_csv(circleRegionInfo, index=False)
        empty_box_regions.to_csv(boxRegionInfo, index=False)
        empty_polygon_regions.to_csv(polygonInfo, index=False)

    def __str__(self):
        return 'database'  


def get_lists_absolute(new_set, old_set):
    return list(new_set - old_set), list(old_set - new_set)