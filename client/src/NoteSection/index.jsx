import React from 'react';
import { Card, CardContent, Typography, Grid, Avatar, Link } from '@mui/material';
import { useTranslation } from "react-i18next";

const NoteSection = ({ icon: Icon, text, link }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ margin: 'auto', mt: 5 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main' }} data-testid="NoteSection-icon">
              <Icon />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6">{t("info")}</Typography>
            <Typography variant="body1">
              {text}{' '}
              {link && (
                <Link href={link} target="_blank" rel="noopener noreferrer">
                  {t("here")}.
                </Link>
              )}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NoteSection;
