/** @jsx jsx */
import React, { useEffect, useRef, useState } from "react";
import { classNames, css, jsx } from 'jimu-core'
import { JimuMapView } from "jimu-arcgis";
import { IMConfig, SearchField, SearchType } from "../../config";
import { areAllRequiredFieldsFilled, focusOnMapPoint, handleFieldAutocomplete } from "./search-service";
import { Autocomplete } from '../../../../shared-code/common-components/autocomplete'

interface SearchFieldsProps {
    searchOption: SearchType;
    currentJimuMapView: JimuMapView;
    config: IMConfig;
    setShowNoResultsMsg: (show: boolean) => void;
    setMessage: (msg: string) => void;
}

export const SearchFields: React.FC<SearchFieldsProps> = ({ searchOption, currentJimuMapView, config, setShowNoResultsMsg, setMessage }) => {

    const [inputValues, setInputValues] = useState({});
    const [visibleCloseButtons, setVisibleCloseButtons] = useState({});
    const inputRefs = useRef<HTMLInputElement[] | (HTMLDivElement | null)[]>([]);
    const inputValuesRef = useRef({});
    const searchInput = useRef<HTMLDivElement>(null);
    const searchIcon = require("../assets/images/searchempty.png");
    const closeImg = require('../assets/images/Close.png');

    useEffect(() => {
        if (inputRefs.current[0]) {
            (inputRefs.current[0] as HTMLInputElement).focus();
        }
        clearResults();
    }, [searchOption]);

    const onValidationInputChange = (e, field: SearchField) => {
        const value = typeof (e) !== 'object' ? e
            : e.attributes && e.attributes[field.displayField] ? e.attributes[field.displayField]
                : e.target?.value ? e.target?.value
                    : field.displayField && e[field.displayField] && !field.titleDisplayField ? e[field.displayField] :
                        field.titleDisplayField ? e : '';

        inputValuesRef.current = {
            ...inputValuesRef.current,
            [field.key]: value
        };

        setInputValues(prev => ({
            ...prev,
            [field.key]: value
        }));

        setVisibleCloseButtons(prev => ({
            ...prev,
            [field.key]: value && value !== ""
        }));
    };

    const clearField = (fieldKey) => {

        inputValuesRef.current = {
            ...inputValuesRef.current,
            [fieldKey]: ""
        };

        setInputValues(prev => ({
            ...prev,
            [fieldKey]: ""
        }));

        setVisibleCloseButtons(prev => ({
            ...prev,
            [fieldKey]: false
        }));
    };

    const clearResults = () => {
        inputValuesRef.current = {};
        setInputValues({});
        setVisibleCloseButtons({});
    }

    const autocompleteQuery = async (e: string, field: SearchField): Promise<any[]> => {
        return handleFieldAutocomplete(e, field, inputValuesRef.current, currentJimuMapView.view as __esri.MapView, config, setShowNoResultsMsg, setMessage);
    }

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key === "Enter") {
            await handleEnterPress(index);
        }
    };

    // Handles the Enter key behavior. If not on the last input, moves focus to the next one. If on the last, it triggers the map search and resets inputs.F
    const handleEnterPress = async (index?: number, values?: {}) => {
        const nextRef = inputRefs.current[index + 1];

        if (index < searchOption.fields.length - 1 && nextRef && typeof nextRef.focus === 'function') {
            setTimeout(() => { nextRef.focus(); }, 0);
        } else {
            searchAndFocusOnMap(values ?? inputValues);
        }
    };

    // Checks if all required fields are filled. If they are, it triggers the map to focus on the corresponding point.
    const searchAndFocusOnMap = async (values?: {}) => {
        if (areAllRequiredFieldsFilled(searchOption, values ?? inputValues)) {
            await focusOnMapPoint(currentJimuMapView.view as __esri.MapView, config, searchOption, values ?? inputValues, setShowNoResultsMsg, setMessage);
            clearResults();
            if (inputRefs.current[0]) {
                (inputRefs.current[0] as HTMLInputElement).focus();
            }
        }
    }

    const handleItemSelect = async (event: React.KeyboardEvent<HTMLInputElement>, field: SearchField, index: number) => {
        onValidationInputChange(event, field);

        await handleEnterPress(index, inputValuesRef.current);
    };

    const getWidthPercentage = (): number => {
        const count: number = searchOption.fields.length;
        if (count === 1) return 100;
        if (count === 2) return 47;
        if (count === 3) return 32;

        return (100 / count) - 1.5;
    };

    const getCloseWidthPercentage = (): number => {
        const count: number = searchOption.fields.length;
        if (count === 1) return 5;
        if (count === 2) return 10;
        if (count === 3) return 15;
    };

    const style = css`
        .search-fields {
            display: flex;
            overflow: auto;
            width: 100%;
            margin-top: 3px;
        
            .search-input {
                margin: 3px;
                padding-right: 3px;
                display: flex;
                align-items: center;
                width: 100%

                input:focus {
                    outline: none !important;
                }
                img.close {
                    cursor: pointer;
                    height: 15px;
                    &.hide {
                        // display: none;
                        visibility: hidden;
                    }
                }
            }

            .freeSearch>div {
                width: 100%;
            }

            .dividing-line {
                border-right: 1px solid gray !important;
            }
            input {
                width: 94% !important;
                border: none;
            }
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .search-icon {
                cursor: pointer;
                width: 20px;
                height: 20px;
                margin: 5px 5px 0 2px;
                transition: all 0.2s ease;
                
                &:hover, &:focus {
                  transform: scale(1.1);
                  filter: brightness(0.7);
                }
                &:active {
                  transform: scale(1.2);
                  filter: brightness(0.5);
                }
            }
        }        
    `;

    return (
        <div css={style}>
            <div className="search-fields">
                {searchOption.fields.map((field, index) => {
                    const fieldKey = field.key;

                    switch (field.type) {
                        case 'text':
                        case 'number':
                            return (
                                <div className={classNames('search-input', { 'dividing-line': index != (searchOption.fields.length - 1) })} style={{ width: `${getWidthPercentage()}%` }}>
                                    <input
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        key={fieldKey}
                                        id={field.key}
                                        type={field.type}
                                        autoComplete="off"
                                        placeholder={field.label}
                                        name={field.label}
                                        value={inputValues[fieldKey] || ""}
                                        onChange={(e) => onValidationInputChange(e, field)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                    />
                                    <img className={classNames('close', { 'hide': !visibleCloseButtons[fieldKey] })}
                                        style={{ width: `${getCloseWidthPercentage()}%` }}
                                        src={closeImg}
                                        alt="Clear"
                                        onClick={() => clearField(fieldKey)}></img>
                                </div>
                            );

                        case 'autocomplete':
                            return (
                                <div ref={searchInput} className={classNames('search-input', { 'dividing-line': index != (searchOption.fields.length - 1), 'freeSearch': searchOption.fields.length == 1 && index == 0 })} style={{ width: `${getWidthPercentage()}%` }}>
                                    <Autocomplete
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        key={field.key}
                                        id={field.key}
                                        placeholder={field.label}
                                        maxResultToShow={6}
                                        value={inputValues[fieldKey] || ""}
                                        onChange={(e) => onValidationInputChange(e, field)}
                                        displayField={field.displayField}
                                        titleDisplayField={field.titleDisplayField}
                                        queryFunction={(e) => { return autocompleteQuery(e, field) }}
                                        onItemSelect={(e) => handleItemSelect(e, field, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        searchIcon={false}
                                        defaultStyle={true}
                                        autocompleteListWidth={`${searchInput.current?.offsetWidth}px`}
                                    ></Autocomplete>
                                    <img className={classNames('close', { 'hide': !visibleCloseButtons[fieldKey] })} style={{ width: `${getCloseWidthPercentage()}%` }} src={closeImg}
                                        alt="Clear"
                                        onClick={() => clearField(fieldKey)}></img>
                                </div>
                            )

                        default:
                            return null;
                    }
                })}

                <img src={searchIcon} className="search-icon" onClick={() => searchAndFocusOnMap()} />

            </div>
        </div>
    );
}
