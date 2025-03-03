import { observer } from "mobx-react-lite";

import { useEffect } from "react";
import React from "react";

const TemplatesView = observer(() => {


  return (
    <div
    >
      <button
        className="template-container"
        style={{ color: "black" }}
      >
        Create Value
      </button>
    </div>
  );
});
export default TemplatesView;
