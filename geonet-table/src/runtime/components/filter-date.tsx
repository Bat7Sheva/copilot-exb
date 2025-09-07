/** @jsx jsx */
import { classNames, css, jsx, defaultMessages as jimuCoreMessages } from "jimu-core";
import { defaultMessages as jimuUIMessages } from "jimu-ui";
import { useEffect, useRef, useState } from "react";
import { FilterActions } from "./filter-actions";
import { IMConfig } from "../../config";


interface FilterDateProps {
    field: any;
    config: IMConfig;
    props: any;
    initialValue?: { fromDate?: string; toDate?: string };
    onSearch: (fieldName: string, value: {}, query?: string) => void;
}

export const FilterDate = ({ field, config, props, initialValue, onSearch }: FilterDateProps) => {

    const [fromDate, setFromDate] = useState<string>(initialValue?.fromDate || "");
    const [toDate, setToDate] = useState<string>(initialValue?.toDate || "");
    const [isValid, setIsValid] = useState<boolean>(true);
    const allDefaultMessages = Object.assign({}, jimuCoreMessages, jimuUIMessages)

    const formatMessage = (id, values?: any) => {
        return props.intl.formatMessage({ id: id, defaultMessage: allDefaultMessages[id] }, values)
    }

    const clearDate = () => {
        setFromDate("");
        setToDate("");
        setIsValid(true);
        onSearch(field.name, { fromDate, toDate });
    };

    const handleSearch = () => {
        if (validateDates(fromDate, toDate)) {
            const where = props.config.queries.date.replaceAll('{0}', field.name).replace('{1}', fromDate).replace('{2}', toDate);
            onSearch(field.name, { fromDate, toDate }, where);
        } else {
            setIsValid(false);
        }
    };

    const validateDates = (from: string, to: string): boolean => {
        if (!from || !to) return false;
        const fromTime = new Date(from).getTime();
        const toTime = new Date(to).getTime();
        return fromTime <= toTime;
    };


    const style = css`
    
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 10px;
      width: 260px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);


    .date-input {
      margin-bottom: 8px;
      padding: 6px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .error {
      color: red;
      font-size: 12px;
      margin-bottom: 6px;
    }
  `;

    return (
        <div css={style} className="container">

            {/* שדות תאריך */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>

                    <label>{formatMessage("fromDatePlaceHolder") || "מתאריך"}</label>
                    <input
                        type="date"
                        className="date-input"
                        autoFocus
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <label>עד תאריך</label> {/* {formatMessage("toDatePlaceholder") || "עד תאריך"} */}
                    <input
                        type="date"
                        className="date-input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                {/* הודעת שגיאה */}
                {!isValid && (
                    <div className="error">טווח תאריכים לא תקין: "עד תאריך" חייב להיות אחרי "מתאריך"</div>
                )}

            </div>

            <FilterActions onClear={clearDate} onSearch={handleSearch} />
        </div>
    )
};