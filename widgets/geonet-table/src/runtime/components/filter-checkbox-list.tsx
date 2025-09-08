/** @jsx jsx */
import { classNames, css, jsx } from "jimu-core";
import { useState } from "react";
import { FilterActions } from "./filter-actions";

interface FilterCheckboxListProps {
    field: any;
    props: any;
    initialValue?: string[];
    onSearch: (fieldName: string, value: string[], query?: string) => void;
}

export const FilterCheckboxList = ({ field, props, initialValue, onSearch }: FilterCheckboxListProps) => {

    const [selectedValues, setSelectedValues] = useState<string[]>(initialValue || []);

    const clear = () => {
        setSelectedValues([]);
        onSearch(field.name, selectedValues);
    };

    const handleSearch = () => {
        let where = '';
        if (field.type === 'string') {
            where = props.config.queries.checkboxList.replace('{0}', field.name).replace('{1}', selectedValues.map(v => `'${v}'`).join(','));
        } else {
            where = props.config.queries.checkboxList.replace('{0}', field.name).replace('{1}', selectedValues.join(','));
        }
        onSearch(field.name, selectedValues, where);
    };


    const style = css`
    `;


    return (
        <div css={style}>

            <div style={{ minHeight: '50px', maxHeight: '90px', overflowY: 'auto', marginBottom: '8px' }}>
                {field.domain.codedValues.map((x, i) => (
                    <div key={i}>
                        <input
                            id={x.code}
                            type="checkbox"
                            name="checkbox-group"
                            checked={selectedValues.includes(x.code)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedValues([...selectedValues, x.code]);
                                } else {
                                    setSelectedValues(selectedValues.filter(val => val !== x.code));
                                }
                            }}
                        />
                        <label htmlFor={x.code} className="form-check-label" >
                            {x.name}
                        </label>

                    </div>
                ))}
            </div>

            <FilterActions onClear={clear} onSearch={handleSearch} />
        </div>
    )
};