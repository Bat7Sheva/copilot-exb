/** @jsx jsx */
import { forwardRef, useEffect, useRef, useState } from 'react';
import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { classNames, css, jsx } from 'jimu-core';
import { Popper } from 'jimu-ui';

interface AutocompleteProps {
    id?: string;
    placeholder: string;
    value: string | any;
    onChange: (value: string) => void;
    queryFunction: (searchText: string, data?: any) => Promise<any[]>;
    onItemSelect: (item: any, setInputVal: boolean) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
    titleDisplayField: string;
    displayField: string;
    maxResultToShow?: number;
    searchIcon?: boolean;
    defaultStyle?: boolean;
    autocompleteListWidth?: string;
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
    ({
        id,
        placeholder,
        value,
        onChange,
        queryFunction,
        onItemSelect,
        onKeyDown,
        titleDisplayField,
        displayField,
        maxResultToShow,
        searchIcon,
        defaultStyle,
        autocompleteListWidth
    }, ref) => {

        const [results, setResults] = useState<any[]>([]);
        const [showResults, setShowResults] = useState(false);
        const searchIconImg = require("../assets/images/searchempty.png");
        const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
        const resultsContainerRef = useRef<HTMLDivElement>(null);
        const subjectRef = useRef(new Subject<string>());
        const subRef = useRef<Subscription | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const inputContainer = useRef<HTMLDivElement>(null);



        useEffect(() => {
            return () => subRef.current.unsubscribe();
        }, []);

        useEffect(() => {
            if (!queryFunction) return;

            subRef.current = subjectRef.current
                .asObservable()
                .pipe(debounceTime(200))
                .subscribe(async (val) => {
                    if (!val) {
                        setResults([]);
                        setShowResults(false);
                        return;
                    }
                    if (value == val) return;
                    const result = await queryFunction(val);
                    if (result && result.length > 0) {
                        if (!maxResultToShow) maxResultToShow = 15;
                        setResults(result.slice(0, maxResultToShow) ?? []);
                        setHighlightedIndex(0);
                        setShowResults(true);
                    } else {
                        setResults([]);
                        setShowResults(false);
                    }
                });

        }, []);

        // Closes the autocomplete results list when the component loses focus,
        useEffect(() => {
            const handleMouseDown = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    // דחיית סגירה כדי לא לחסום את ה־onClick
                    setTimeout(() => {
                        setShowResults(false);
                    }, 0);
                }
            };

            document.addEventListener('mousedown', handleMouseDown);
            return () => {
                document.removeEventListener('mousedown', handleMouseDown);
            };
        }, []);

        const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // subjectRef.current.next(value);

            // if (!showResults || results.length === 0) return;

            if (e.key == 'Enter') {
                if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                    onSelect(results[highlightedIndex]);
                }
            }
            if (onKeyDown && highlightedIndex == -1)
                onKeyDown(e);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showResults || results.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex((prev) => {
                        const newIndex = (prev + 1) % results.length;
                        scrollToHighlightedItem(newIndex);
                        return newIndex;
                    });
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex((prev) => {
                        const newIndex = prev <= 0 ? results.length - 1 : prev - 1;
                        scrollToHighlightedItem(newIndex);
                        return newIndex;
                    });
                    break;
                case 'Escape':
                    setShowResults(false);
                    break;
                case 'Tab':
                    setShowResults(false);
                    break;
            }
        };

        const scrollToHighlightedItem = (index: number) => {
            if (!resultsContainerRef.current) return;
            const itemEl = resultsContainerRef.current.children[index] as HTMLElement;
            if (itemEl) {
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };

        const onSelect = (item: any) => {
            const text = item[displayField] ?? item.attributes?.[displayField] ?? '';
            onChange(text);
            onItemSelect(item, true);
            setShowResults(false);
            setHighlightedIndex(-1);
        };

        const handleOnChange = (e) => {
            setHighlightedIndex(-1);
            onChange(e.target.value);
            if (e.target.value !== value)
                subjectRef.current.next(e.target.value);
        }


        const defaultAutocompleteStyle = css`
        .input-container {
          input:focus {
            outline: none;
          }
        }
        .autocomplete {
            // position: absolute;
            // top: 37px;
            background-color: var(--white);
            margin-right: 4px;
            // overflow: auto;
            // max-height: 250px;
            border-radius: 0 0 8px 8px;
            padding-bottom: 4px;
            width: 100%;
            box-shadow: none;


            .autocomplete-item {
                display: flex;
                // justify-content: center;
                // background-color: var(--white);
                justify-content: flex-start;
                padding: 0.5rem;
                cursor: pointer;
                margin: 0 4px;

                .content {
                    display: flex;
                    flex-direction: column;
                }
            }
            
            .highlighted{
                cursor: pointer;
                background-color: var(--ref-palette-primary-100);
            }
        }
            
        .popper, .popper-box {
            border-radius: 8px;
            background-color: transparent !important;
            color: var(--primary) !important;
        }
        `;

        const style = css`
        .autocomplete-container {
          margin: 0px 2.5rem;
    
          .input-container {
            position: relative;
            display: flex;
            justify-content: center;
            width: 100%;
    
            input:focus {
                outline: none;
            }

            .search-icon {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 16px;
              pointer-events: none;
              width: 17px;
            }
          }

          .input-container input {
            padding-right: 30px;
            padding-left: 10px;
            border: 0.5px solid var(--primary-900);
            border-radius: 5px;
            background-color: var(--ref-palette-primary-400);
            color: var(--ref-palette-secondary-300);
            height: 35px;
            width: 100%;

            ::-webkit-input-placeholder {
              color: var(--ref-palette-secondary-300);
            }
          }      
    
          .autocomplete {
            border: 1px solid #8d8181;
            margin: 0 4px;
            overflow: auto;
            max-height: 250px;
    
            .autocomplete-item {
              display: flex;
              justify-content: center;
              border-right: 1px solid #8d8181;
              padding: 0.5rem;
              cursor: pointer;
              background-color: var(--ref-palette-primary-400);
            }

            .highlighted{
                cursor: pointer;
                background-color: var(--primary-600);
            }
          }
        }
  `;

        return (
            <div ref={containerRef} css={defaultStyle ? defaultAutocompleteStyle : style}>
                <div className="autocomplete-container">
                    <div ref={inputContainer} className="input-container">
                        <input
                            ref={ref}
                            id={id}
                            type="text"
                            autoComplete="off"
                            placeholder={placeholder}
                            value={typeof (value) !== 'object' ? value : value[displayField] ?? value.attributes?.[displayField] ?? ''}
                            onChange={(e) => {
                                handleOnChange(e)
                            }}
                            onKeyUp={handleKeyUp}
                            onKeyDown={handleKeyDown}
                        />
                        {searchIcon && <img src={searchIconImg} className="search-icon" />}
                    </div>

                    {defaultStyle ?
                        <Popper css={defaultStyle ? defaultAutocompleteStyle : style}
                            style={{
                                borderRadius: '8px', marginTop: '0.5rem',
                                backgroundColor: "transparent",
                                boxShadow: "none", border: "none"
                            }}
                            open={showResults}
                            reference={inputContainer.current}
                            placement="bottom-start"
                            // toggle={() => setShowResults(!showResults)}
                            autoFocus={false}
                        >
                            <div
                                className={classNames('autocomplete')}
                                style={{ width: autocompleteListWidth ?? 'auto' }}
                                // style={{ width: containerRef.current?.offsetWidth }}
                                ref={resultsContainerRef} >

                                {results.map((item, index) => {
                                    const text = item[displayField] ?? item.attributes?.[displayField] ?? '';
                                    return (
                                        <div
                                            key={index}
                                            className={classNames("autocomplete-item", { 'highlighted': index === highlightedIndex })}
                                            onMouseDown={() => onSelect(item)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                        >
                                            <div className='content'>
                                                <strong>{item[titleDisplayField]}</strong>
                                                {highlightMatch(text, value)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Popper>
                        :
                        showResults && results.length > 0 && (
                            <div
                                className={classNames('autocomplete')}
                                style={{ width: autocompleteListWidth ?? 'auto' }}
                                ref={resultsContainerRef} >

                                {results.map((item, index) => {
                                    const text = item[displayField] ?? item.attributes?.[displayField] ?? '';
                                    return (
                                        <div
                                            key={index}
                                            className={classNames("autocomplete-item", { 'highlighted': index === highlightedIndex })}
                                            onClick={() => onSelect(item)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                        >
                                            <div className='content'>
                                                <strong>{item[titleDisplayField]}</strong>
                                                {highlightMatch(text, value)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }

                </div>
            </div >
        );
    });


export const highlightMatch = (text: string, query: string) => {

    const style = css`
        .bold {
            color: rgb(3 209 163);;
        }`;

    const isRTL = (text: string): boolean => {
        return /^[\u0590-\u05FF]/.test(text);
    };

    if (!query) return text;
    const index = text.toString().toLowerCase().indexOf(query.toString().toLowerCase());
    if (index === -1) return text;

    const before = text.toString().substring(0, index);
    const match = text.toString().substring(index, index + query.toString().length);
    const after = text.toString().substring(index + query.toString().length);

    return (
        <span css={style} dir={isRTL(text) ? 'rtl' : 'ltr'}>
            {before}
            <strong>{match}</strong>
            {after}
        </span>
    );
};