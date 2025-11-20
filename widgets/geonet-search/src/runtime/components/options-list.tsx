/** @jsx jsx */
import React, { useEffect, useRef, useState } from "react";
import { classNames, css, jsx } from 'jimu-core';
import { SearchType } from "../../config";

interface OptionsListProps {
  widthStyle?: string;
  options: SearchType[];
  selectedOption: SearchType | null;
  onSelect: (item: SearchType) => void;
  onClose: () => void;
}

export const OptionsList: React.FC<OptionsListProps> = ({ widthStyle, options, selectedOption, onSelect, onClose }) => {

  const selectedIndex = options.findIndex(opt => opt.key === selectedOption?.key);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(selectedIndex);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, options]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      onSelect(options[highlightedIndex]);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (listRef.current && !listRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const style = css`
    .option-list {
      // width: 427px;
      margin: 4px 5px 0 0;
      padding: 8px;
      overflow: auto;
      overflow: hidden;
      border-radius: 8px;
      background-color: var(--white);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      height: 275px;
      // max-height: 260px;
 
      .option {
        display: flex;
        justify-content: flex-start;
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 8px;
        background-color: var(--white);
 
        &.highlighted {
          background-color: var(--primary-100);
          font-weight: bold;
        }
      }
    }
  `;

  return (
    <div css={style}>
      <div className="option-list" ref={listRef} style={{ width: widthStyle ?? 'auto' }}>
        {options.map((item, index) => (
          <div
            key={item.key}
            className={`option ${index === highlightedIndex ? 'highlighted' : ''}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};