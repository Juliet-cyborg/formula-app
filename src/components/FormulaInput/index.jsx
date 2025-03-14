import React, { useState } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {fetchSuggestions} from "../../store/tags-service/action";
import {FormulaContainerStyled} from "./styled";
import {mathOperands, numberBeforeOperatorPattern, operatorPrefixPattern, operatorStartRegex} from "../utils/constants";

export const FormulaInput = () => {
    const [formula, setFormula] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const { data: options = [] } = useQuery({
        queryKey: ["autocomplete", inputValue.replace(operatorStartRegex, "")],
        queryFn: () => fetchSuggestions(inputValue.replace(operatorStartRegex, "")),
        enabled: inputValue.trim() !== "" && !mathOperands.test(inputValue),
    });

    const addTagOrText = (value) => {
        if (!value.trim()) return;

        if (numberBeforeOperatorPattern.test(value.trim()) || formula.some(item => item.value === value.trim())) {
            setFormula(prev => [...prev, { type: "text", value: value.trim() }]);
        } else {
            setFormula(prev => [...prev, { type: "tag", value: value.trim() }]);
        }

        setInputValue("");
    };

    const handleAutocompleteChange = (_, newValue) => {
        if (!newValue) return;

        const match = newValue.match(operatorPrefixPattern);

        if (match) {
            const operator = match[1];
            const tagValue = match[2].trim();

            const isTagValid = options.some(option => option.name.toLowerCase() === tagValue.toLowerCase());

            if (isTagValid) {
                setFormula(prev => [...prev, { type: "text", value: operator }, { type: "tag", value: tagValue }]);
            } else {
                setFormula(prev => [...prev, { type: "text", value: operator + tagValue }]);
            }

            setInputValue("");
            return;
        }

        addTagOrText(newValue);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Backspace" && inputValue === "" && formula.length > 0) {
            setFormula(prev => prev.slice(0, -1));
        }
    };

    return (
        <FormulaContainerStyled>
            {formula.map((item, index) =>
                item.type === "tag" ? (
                    <Chip key={index} label={`#${item.value}`} sx={{ margin: "2px" }} />
                ) : (
                    <span key={index} style={{ margin: "0 5px" }}>{item.value}</span>
                )
            )}
            <Autocomplete
                freeSolo
                options={options.map(option => option.name)}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                onChange={handleAutocompleteChange}
                sx={{ display: "inline-block", width: "auto" }}
                open={inputValue !== "" && !mathOperands.test(inputValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        onKeyDown={handleKeyDown}
                        sx={{ minWidth: "100px" }}
                    />
                )}
            />
        </FormulaContainerStyled>
    );
};
