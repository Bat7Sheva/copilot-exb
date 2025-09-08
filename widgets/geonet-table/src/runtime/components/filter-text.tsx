/** @jsx jsx */
import { css, jsx } from "jimu-core";
import { useRef, useState } from "react";
import { FilterActions } from "./filter-actions";

interface FilterTextProps {
    field: any;
    props: any;
    initialValue?: string;
    onSearch: (fieldName: string, value: string, query?: string) => void;
}

export const FilterText = ({ field, props, initialValue = "", onSearch }: FilterTextProps) => {

    const [inputValue, setInputValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    const clearText = () => {
        setInputValue("");
        inputRef.current?.focus();
        onSearch(field.name, inputValue);
    };

    const handleSearch = () => {
        const where = props.config.queries.text.replace('{0}', field.name).replace('{1}', inputValue);
        onSearch(field.name, inputValue, where);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
        // space handled in input field
        else if (e.key === " ") {
            e.stopPropagation();
            setInputValue(e.target.value);
        }
    };

    const style = css`

        .container {
            display: flex;
            align-items: center;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 4px 8px;
            width: 250px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);

            input.filter-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            }
        }
    `;


    return (
        <div css={style} className="container" style={{ display: 'flex', alignItems: 'center' }}>
            {/* שדה טקסט */}
            <input
                ref={inputRef}
                type="text"
                placeholder={field.alias || field.name}
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="filter-input"
                style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    fontSize: "14px"
                }}
            />

            <FilterActions onClear={clearText} onSearch={handleSearch} />
        </div>
    )
};