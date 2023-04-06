import { OutputTabs, Tab } from "@cadl-lang/playground/src/components/output-tabs.js";
import { selectedEmitterState } from "@cadl-lang/playground/src/state.js";
import { FunctionComponent, useCallback, useState } from "react";
import { useSetRecoilState } from "recoil";

export interface EmitterTabsProps {}

export const EmitterTabs: FunctionComponent<EmitterTabsProps> =  () => {
    
    const [EmitterSelection, setEmitterSelection] = useState<EmitterSelection>({
        type: "openapi3"
    })

    const setSelectedEmitter = useSetRecoilState(selectedEmitterState)

    const emitterTabs: Tab[] = [
        { id: "openapi3", name: "OpenApi", align: "left" },
        { id: "validator", name: "TypeSpec Validation", align: "left"}
    ];

    const handleEmitterSelection = useCallback((tabId: string) => {
        if (tabId === "openapi3") {
            setEmitterSelection({type: "openapi3"});
            setSelectedEmitter("@cadl-lang/openapi3")
        } else {
            setEmitterSelection({type: "validator"});
            setSelectedEmitter("typespec-validation")
        }
    }, [EmitterSelection]);

    return (
        <OutputTabs
            tabs={emitterTabs}
            selected={EmitterSelection.type}
            onSelect={handleEmitterSelection}
        />
    );
};

type EmitterSelection = 
    | { type: "openapi3" }
    | { type: "validator"}
    ;