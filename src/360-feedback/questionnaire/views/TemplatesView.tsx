import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import { useEffect } from "react";
import React from "react";

const TemplatesView = observer(() => {
  const { api, store, ui } = useAppContext();

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
