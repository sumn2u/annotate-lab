// @flow

import ReactDOM from "react-dom";
import Theme from "./Theme";
import DemoSite from "./DemoSite";
import "./site.css";

const Site = () => {
  return (
    <Theme>
      <DemoSite />
    </Theme>
  );
};

ReactDOM.render(<Site />, document.getElementById("root"));
