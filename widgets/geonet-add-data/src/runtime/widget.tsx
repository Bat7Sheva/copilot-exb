/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, MutableStoreManager, hooks, ReactRedux, type IMState, WidgetState, indexedDBUtils } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'

import { EmptyOutlined } from 'jimu-icons/outlined/application/empty'

import defaultMessages from './translations/default'
import { type IMConfig } from '../config'
import { type DataOptions } from './types'
import { createDataSourcesByDataOptions, destroyDataSourcesById, updateDataSourcesByDataOptions } from './utils'
import { AddDataPopper, type SupportedTabs } from './components/add-data-popper'
import { DataList } from './components/data-list'
import { versionManager } from '../version-manager'

const { useState, useEffect, useMemo, useRef, useCallback } = React
const useCache = !window.jimuConfig.isInBuilder

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { portalUrl, id, enableDataAction = true, config, mutableStateProps } = props
  const multiDataOptions: DataOptions[] = useMemo(() => mutableStateProps?.multiDataOptions || [], [mutableStateProps?.multiDataOptions])
  const setMultiDataOptions = useCallback((multiDataOptions: DataOptions[]) => {
    MutableStoreManager.getInstance().updateStateValue(id, 'multiDataOptions', multiDataOptions)
  }, [id])
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const hiddenAddDataTabs = useMemo(() => {
    const items: SupportedTabs[] = []
    if (config.disableAddBySearch) items.push('search')
    if (config.disableAddByUrl) items.push('url')
    if (config.disableAddByFile) items.push('file')
    return items
  }, [config.disableAddBySearch, config.disableAddByUrl, config.disableAddByFile])
  const nextOrder = useMemo(() => multiDataOptions.length > 0 ? Math.max(...multiDataOptions.map(d => d.order)) + 1 : 0, [multiDataOptions])
  const rootDomRef = React.useRef<HTMLDivElement>(null)
  const cache = useRef<indexedDBUtils.IndexedDBCache>(null)
  const [isOpenAddDataPopper, setIsOpenAddDataPopper] = useState<boolean>(false);  // geonet


  useEffect(() => {
    // Init indexed DB and set cached data to state.
    cache.current = new indexedDBUtils.IndexedDBCache(id, 'add-data', 'added-data')
    useCache && cache.current.init().then(async () => {
      const cachedDataOptions = await cache.current.getAll()
      if (cachedDataOptions.length > 0) {
        setIsLoading(true)
        createDataSourcesByDataOptions(cachedDataOptions, id).catch(err => {
          console.error('Failed to create data source', err)
        }).finally(() => {
          setIsLoading(false)
        })
        setMultiDataOptions(cachedDataOptions.sort((d1, d2) => d1.order - d2.order))
      }
    }).catch(err => {
      console.error('Failed to read cache.', err)
    })

    return () => { cache.current.close() }
  }, [id, setMultiDataOptions])

  const onAddData = (addedMultiDataOptions: DataOptions[]) => {
    // Creat new data based on diff.
    cache.current.initialized() && cache.current.putAll(addedMultiDataOptions.map(d => ({ key: d.dataSourceJson.id, value: d })))
    setIsLoading(true)
    createDataSourcesByDataOptions(addedMultiDataOptions, id).catch(err => {
      console.error('Failed to create data source', err)
    }).finally(() => {
      setIsLoading(false)
    })

    setMultiDataOptions(multiDataOptions.concat(addedMultiDataOptions))
  }

  const onRemoveData = (dsId: string) => {
    // Remove data based on diff.
    cache.current.initialized() && cache.current.deleteAll([dsId])
    destroyDataSourcesById([dsId], id).catch(err => {
      console.error('Failed to remove data source', err)
    })

    setMultiDataOptions(multiDataOptions.filter(d => d.dataSourceJson.id !== dsId))
  }

  const onChangeData = (newDataOptions: DataOptions) => {
    // Update data based on diff.
    cache.current.initialized() && cache.current.put(newDataOptions.dataSourceJson.id, newDataOptions)
    setIsLoading(true)
    updateDataSourcesByDataOptions([newDataOptions], id).catch(err => {
      console.error('Failed to update data source', err)
    }).finally(() => {
      setIsLoading(false)
    })

    setMultiDataOptions(multiDataOptions.map(d => {
      if (d.dataSourceJson.id === newDataOptions.dataSourceJson.id) {
        return newDataOptions
      } else {
        return d
      }
    }))
  }

  const stateInControllerWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetsRuntimeInfo = state?.widgetsRuntimeInfo
    return widgetsRuntimeInfo?.[id]?.state
  })
  // geonet start
  const setIsOpen = (val: boolean) => {
    setIsOpenAddDataPopper(val);
  }
  // geonet end

  const hideAddDataPopper = useMemo(() => stateInControllerWidget === WidgetState.Closed, [stateInControllerWidget])

  return (
    <div className='widget-add-data jimu-widget d-flex align-items-center justify-content-center surface-1 border-0' css={style} ref={rootDomRef}>
      {
        multiDataOptions.length === 0 &&
        // <div className='no-data-placeholder w-100'>
        <div className='w-100 h-100 p-4'> {/* geonet */}
          
          {/* geonet start */}
          {/* <div className='no-data-placeholder-icon'>
            <EmptyOutlined size={32} color='var(--dark-500)' />
          </div>
          <div className='no-data-placeholder-text'>
            <span>{ config.placeholderText || translate('defaultPlaceholderText') }</span>
          </div> */}
          {/* geonet end */}
          <div className='no-data-placeholder-btn d-flex justify-content-end'> {/* geonet */}
            <AddDataPopper config={config} buttonSize='lg' portalUrl={portalUrl} widgetId={id} onFinish={onAddData} hiddenTabs={hiddenAddDataTabs} popperReference={rootDomRef} nextOrder={nextOrder} itemCategoriesInfo={config.itemCategoriesInfo} hidePopper={hideAddDataPopper} />
          </div>
        </div>
      }
      {
        multiDataOptions.length > 0 &&
        <div className='w-100 h-100 p-4'>
          {/* geonet start*/}
          <div className='no-data-placeholder-btn d-flex justify-content-end mb'> {/* geonet add mb class and setIsOpenAddDataPopper param */}
            <AddDataPopper setIsOpenAddDataPopper={setIsOpen} config={config} buttonSize='lg' portalUrl={portalUrl} widgetId={id} onFinish={onAddData} hiddenTabs={hiddenAddDataTabs} popperReference={rootDomRef} nextOrder={nextOrder} itemCategoriesInfo={config.itemCategoriesInfo} hidePopper={hideAddDataPopper} />
          </div>
          {/* geonet add isOpenAddDataPopper condition*/}
          {!isOpenAddDataPopper &&
            <DataList multiDataOptions={multiDataOptions} enableDataAction={enableDataAction} isLoading={isLoading} widgetId={id} onRemoveData={onRemoveData} onChangeData={onChangeData} />
          }
          {/* <div className='w-100 d-flex justify-content-end add-by-search-samll'>
            <AddDataPopper config={config} buttonSize='sm' portalUrl={portalUrl} widgetId={id} onFinish={onAddData} hiddenTabs={hiddenAddDataTabs} popperReference={rootDomRef} nextOrder={nextOrder} itemCategoriesInfo={config.itemCategoriesInfo} hidePopper={hideAddDataPopper} />
          </div> */}
          {/* geonet end*/}
        </div>
      }
    </div>
  )
}

Widget.versionManager = versionManager

export default Widget

const style = css`
  background-color: var(--white);
  position: relative;

  .add-by-search-samll {
    position: absolute;
    bottom: 10px;
    right: 15px;
  }

  .no-data-placeholder {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .no-data-placeholder-text, .no-data-placeholder-icon, .no-data-placeholder-btn{
      display: table;
      margin: 0 auto;
    }
    .no-data-placeholder-text {
      color: var(--dark-500);
      font-size: 0.8125rem;
      margin-top: 1rem;
      text-align: center;
    }
    .no-data-placeholder-icon {
      color: var(--dark-800);
    }
    .no-data-placeholder-btn {
      margin-top: 1rem;
    }
  }

  .mb { // geonet
    margin-bottom: 3rem;
  }
`
