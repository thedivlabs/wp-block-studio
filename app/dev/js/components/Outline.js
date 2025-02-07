import {__experimentalBorderControl as BorderControl} from "@wordpress/components";
import {useState} from "react";


function Outline({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BorderControl
        label={'Outline'}
        value={value}
        enableAlpha={true}
        enableStyle={true}
        disableCustomColors={false}
        colors={wp.data.select("core/editor").getEditorSettings().colors}
        withSlider={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __experimentalIsRenderedInSidebar={true}
        __next40pxDefaultSize
    />;
}

export default Outline;
