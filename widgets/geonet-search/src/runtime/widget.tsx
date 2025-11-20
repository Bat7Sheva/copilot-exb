/** @jsx jsx */
import { useEffect, useRef, useState } from 'react';
import { css, jsx, type AllWidgetProps, getAppStore, ContainerType, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { searchUtils } from 'jimu-layouts/layout-runtime';
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui';
import defaultMessages from './translations/default';
import { OptionsList } from './components/options-list';
import { SearchFields } from './components/search-fields';
import { SearchType, type IMConfig } from '../config'
import './assets/images/searchempty.png'
import { Popper } from 'jimu-ui';
import MessageBox from '../../../shared-code/common-components/message-box';

const Widget = (props: AllWidgetProps<IMConfig>) => {

  const { config, intl, theme } = props;
  const [showSerchOptions, setShowSerchOptions] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] = useState<SearchType[] | null>(null);
  const [selectedSearchOption, setSelectedSearchOption] = useState<SearchType | null>(null);
  const [mapWidgetId, setMapWidgetId] = useState<string>();
  const [currentJimuMapView, setCurrentJimuMapView] = useState<JimuMapView>();
  const [showNoResultsMsg, setShowNoResultsMsg] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const searchBarRef = useRef<HTMLDivElement>(null);
  const arrowBtn = require("./assets/images/Arrow_Bottom.png");

  useEffect(() => {
    const state = getAppStore().getState();
    const { appConfig, browserSizeMode, appRuntimeInfo } = state;
    const { currentPageId, currentDialogId } = appRuntimeInfo;
    const isDialog = !!currentDialogId;
    const containerType = isDialog ? ContainerType.Dialog : ContainerType.Page;
    const containerId = isDialog ? currentDialogId : currentPageId;
    const mapWidgetGroups = searchUtils.getMapWidgets(appConfig, browserSizeMode, containerType, containerId);
    const currentContainerMap = mapWidgetGroups.find(group => group.id === containerId)?.maps;
    if (currentContainerMap?.length > 0) {
      setMapWidgetId(currentContainerMap[0]);
    }
  }, [])

  useEffect(() => {
    if (!searchOptions && props.config?.searchOptions) {
      setSearchOptions(props.config.searchOptions as any);
    }
  }, [])

  useEffect(() => {
    if (searchOptions) setSelectedSearchOption(searchOptions[0]);
  }, [searchOptions])


  const formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuiDefaultMessage, jimuCoreMessages)
    return intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    setCurrentJimuMapView(jimuMapView);
  }

  const selectSearchOption = (option) => {
    setSelectedSearchOption(option);
    setShowSerchOptions(!showSerchOptions);
  }

  const style = css`
  
  .searchBar {

    display: flex;
    flex-direction: row;

    .arrow {
      width: 35px;
      height: 35px;
      border-radius: 8px;
      background-color: var(--primary-700);
      border: 1px solid var(--primary-400);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);


        .arrow-img {
          width:15px;
        }
    }
    
    .search-input-container {
      width: 90%;
      margin-left: 5px;
      background-color: var(--white);
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
  }
      
  .popper, .popper-box {
    border-radius: 8px;
    background-color: transparent !important;
    color:var(--primary) !important;
  }

  `;


  return (
    <div css={style}>

      <div ref={searchBarRef} className='searchBar'>
        <div className="arrow" onClick={() => setShowSerchOptions(!showSerchOptions)}>
          <img className='arrow-img' src={arrowBtn} ></img>
        </div>

        <div className='search-input-container'>
          {selectedSearchOption && <SearchFields searchOption={selectedSearchOption} currentJimuMapView={currentJimuMapView} config={props.config} setShowNoResultsMsg={setShowNoResultsMsg} setMessage={setMessage} />}
        </div>
      </div>

      <Popper css={style}
        style={{ borderRadius: '8px', marginTop: '2px', backgroundColor: "transparent", boxShadow: "none", border: "none" }}
        open={showSerchOptions}
        reference={searchBarRef.current} placement="bottom-start"
        toggle={() => setShowSerchOptions(false)}
        autoFocus={false}
      >
        <OptionsList
          widthStyle={`${searchBarRef.current?.offsetWidth}px`}
          options={searchOptions}
          selectedOption={selectedSearchOption}
          onSelect={(item) => {
            selectSearchOption(item);
            setShowSerchOptions(false);
          }}
          onClose={() => setShowSerchOptions(false)}
        />
      </Popper>

      {mapWidgetId &&
        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={handleActiveViewChange}
        />}

      <MessageBox
        isVisible={showNoResultsMsg}
        position='center'
        type="error"
        message={message !== '' ? '' : formatMessage('noResultsMsg')}
        subMessage={message !== '' ? message : formatMessage('tryAgainMsg')}
        isModal={false}
        showCloseButton={false}
        closeOnOutsideClick={false}
        autoCloseAfter={2500}
        onClose={() => setShowNoResultsMsg(false)}
      />
    </div >
  )
}

export default Widget
