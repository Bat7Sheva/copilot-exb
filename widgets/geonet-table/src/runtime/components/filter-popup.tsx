/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import { useEffect } from "react";
import { FilterText } from "./filter-text";
import { FilterCheckboxList } from "./filter-checkbox-list";
import { FilterDate } from "./filter-date";
import { IMConfig } from '../../config';

type FilterPopupProps = {
  field: any;
  config: IMConfig;
  props: any;
  initialValue?: any;
  cleanFilter: (fieldName: string, value: any, query?: string) => void
};

const FilterPopup = ({ field, config, props, initialValue, cleanFilter }: FilterPopupProps) => {

  const popupRef = React.useRef<HTMLDivElement>(null);

  // Prevent parent/table scroll when mouse is over the popup and at scroll edge
  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
 
    const handleWheel = (e: WheelEvent) => {
      const target = popup;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const atTop = scrollTop === 0;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
 
      if (
        (e.deltaY < 0 && atTop) ||
        (e.deltaY > 0 && atBottom)
      ) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        // Always stop propagation so parent/table doesn't scroll
        e.stopPropagation();
      }
    };
 
    popup.addEventListener('wheel', handleWheel, { passive: false });
 
    return () => {
      popup.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleSearch = (fieldName: string, value: any, query?: string) => {
    cleanFilter(fieldName, value, query);
  };

  const renderSwitch = () => {
    if (
      (field.type === 'string' && !field.domain) ||
      (field.type === 'small-integer' && !field.domain) ||
      field.type === 'double' ||
      field.type === 'integer'
    ) {
      return <FilterText field={field} props={props} initialValue={initialValue} onSearch={handleSearch} />;
    } else if (
      (field.type === 'small-integer' || field.type === 'string') &&
      field.domain && field.domain.codedValues && field.domain.codedValues.length > 0
    ) {
      return <FilterCheckboxList field={field} props={props} initialValue={initialValue} onSearch={handleSearch} />;
    } else if (field.type === 'date') {
      return <FilterDate field={field} config={config} initialValue={initialValue} props={props}
        onSearch={handleSearch} />;
    } else {
      console.log('לא נמצא קומפוננטה מתאימה ל־type:', field.type);
      return null;
    }
  };

  const style = css`
    .container-filter { 
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 10px;
      width: 250px;
      min-width: 200px;
      position: relative;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    } 
  `;


  const renderedComponent = renderSwitch();

  if (!renderedComponent) {
    console.warn('לא נמצאה קומפוננטה מתאימה ל־field:', field);
    return null;
  }

  return (
    <div
      ref={popupRef}
      css={style} className="container-filter"
      style={{
        background: "#fff",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        minWidth: "200px",
        position: "relative",
      }}
    >
      {renderedComponent}
    </div>
  );
};

export default FilterPopup;
