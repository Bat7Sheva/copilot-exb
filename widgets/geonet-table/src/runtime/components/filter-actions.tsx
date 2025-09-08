/** @jsx jsx */
import { css, jsx } from "jimu-core";

interface FilterActionsProps {
    onClear: () => void;
    onSearch: () => void;
}

export const FilterActions = ({ onClear, onSearch }: FilterActionsProps) => {

    const style = css`
    `;

    return (
        <div css={style}>

            {/* איקס מחיקה */}
            <span className="clear-text" style={{ marginRight: "6px", cursor: "pointer", fontWeight: "bold" }}
                onClick={onClear}
                title="נקה טקסט">✕</span>

            {/* קו מפריד */}
            <span className="dividing-line" style={{ marginRight: "6px", color: "#999" }}>|</span>

            {/* אייקון חיפוש */}
            <span className="filter-icon" style={{ marginRight: "6px", cursor: "pointer" }}
                onClick={onSearch}
                title="חפש">🔍</span>
        </div>
    )
};