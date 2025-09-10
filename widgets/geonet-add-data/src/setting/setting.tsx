/** @jsx jsx */
import { jsx, React, css, hooks, Immutable, indexedDBUtils } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages, Switch, TextInput } from 'jimu-ui'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'

import defaultMessages from './translations/default'
import { type ItemCategoryInfo, type IMConfig } from '../config'
import { List, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { getDefaultItemCategoriesInfo, useCuratedIndex, useDefaultLabel } from '../utils'
import SearchConfigItem from './components/search-config-item'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { ItemCategory } from 'jimu-ui/basic/item-selector'

const { useEffect, useRef } = React

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { onSettingChange: propsOnSettingChange, id, config, theme, intl } = props
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const cache = useRef<indexedDBUtils.IndexedDBCache>(null)

  useEffect(() => {
    // Init indexed DB.
    cache.current = new indexedDBUtils.IndexedDBCache(id, 'add-data', 'added-data')
    cache.current.init().catch(err => {
      console.error('Failed to read cache.', err)
    })

    return () => { cache.current.close() }
  }, [id])

  const onSettingChange: typeof propsOnSettingChange = (...args) => {
    propsOnSettingChange(...args)
    // Clear cache on setting change.
    cache.current.initialized() && cache.current.clear()
  }

  const onAddWayChange = e => {
    const key = e.target.value
    const prevValue = config[key]
    const isDisableAddBySearch = key === 'disableAddBySearch'
    if (prevValue === true) {
      const newConfig = isDisableAddBySearch ? config.without(key).merge({ itemCategoriesInfo: Immutable(getDefaultItemCategoriesInfo()) }) : config.without(key)
      onSettingChange({
        id,
        config: {
          ...newConfig
        }
      })
    } else {
      onSettingChange({
        id,
        config: {
          ...(isDisableAddBySearch ? config.without('itemCategoriesInfo') : config),
          [key]: true
        }
      })
    }
  }

  const onPlaceholderTextChange = (value: string) => {
    onSettingChange({
      id,
      config: {
        ...config,
        placeholderText: value
      }
    })
  }

  const onItemCategoryInfoChange = (value, key, index) => {
    const itemCategoriesInfo = [...config.itemCategoriesInfo.asMutable({ deep: true })]
    itemCategoriesInfo[index] = { ...itemCategoriesInfo[index], [key]: value }

    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo
      }
    })
  }

  const onDelete = (index: number) => {
    const itemCategoriesInfo = [...config.itemCategoriesInfo.asMutable()]
    itemCategoriesInfo.splice(index, 1)
    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo
      }
    })
  }

  const curatedIndex = useCuratedIndex(config.itemCategoriesInfo)

  const getDefaultLabel = useDefaultLabel(translate)

  const createListItemElement = (itemCategoryInfo: ItemCategoryInfo, index: number) => {
    return <SearchConfigItem
      intl={intl}
      theme={theme}
      itemCategoryInfo={itemCategoryInfo}
      defaultLabel={getDefaultLabel(itemCategoryInfo)}
      onEnabledChange={(e, checked) => { onItemCategoryInfoChange(checked, 'enabled', index) }}
      onCustomLabelChange={(value) => { onItemCategoryInfoChange(value, 'customLabel', index) }}
      onCuratedFilterChange={(value) => { onItemCategoryInfoChange(value, 'curatedFilter', index) }}
      onDelete={() => { onDelete(index) }}
      translate={translate}
    />
  }

  // const curatedIdRef = useRef(1)
  // useEffect(() => {
  //   if (config.itemCategoriesInfo) {
  //     const curatedOptions = config.itemCategoriesInfo.filter((item) => item.type === ItemCategory.Curated).map((item) => item.id)
  //     const maxOldId = curatedOptions.length ? Math.max(...curatedOptions.map((item) => Number(item.split('_')[1]))) : 0
  //     curatedIdRef.current = maxOldId + 1 || 1
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const onAddCuratedItemCategory = () => {
    onSettingChange({
      id,
      config: {
        ...config,
        itemCategoriesInfo: [...config.itemCategoriesInfo, {
          type: ItemCategory.Curated,
          customLabel: '',
          enabled: true,
          curatedFilter: '',
          id: `${ItemCategory.Curated}_${curatedIndex}`
        }]
      }
    })
    }

    //geonet
    const onGeonetApibaseUrlChange = (value: string) => {
        const newVal = { ...config.GeonetApi, baseUrl: value }
        onSettingChange({
            id,
            config: {
                ...config,
                GeonetApi: newVal
            }
        })
    }
    const onGeonetUploadDwgChange = (value: string) => {
        const newVal = { ...config.GeonetApi, uploadDwg: value }
        onSettingChange({
            id,
            config: {
                ...config,
                GeonetApi: newVal
            }
        })
    }



  return (
    <div className='widget-setting-add-data jimu-widget-setting' css={style}>
      <SettingSection className='border-0 way-of-add-data-section' role='group' title={translate('wayOfAddingData')} aria-label={translate('wayOfAddingData')}>
        <SettingRow className='way-of-add-data-row' label={translate('selectFromAccount')}>
          <Switch onChange={onAddWayChange} value='disableAddBySearch' checked={!config.disableAddBySearch} aria-label={translate('selectFromAccount')} />
        </SettingRow>
        {!config.disableAddBySearch && config.itemCategoriesInfo && <SettingRow className='account-config-row'>
          <List
            className='search-config-list w-100'
            size='sm'
            itemsJson={config.itemCategoriesInfo.asMutable().map((i, x) => ({ itemStateDetailContent: i, itemKey: i.id }))}
            dndEnabled
            onUpdateItem={(actionData, refComponent) => {
              if (actionData.updateType !== TreeItemActionType.HandleDidDrop) {
                return
              }
              const [, parentItemJson] = actionData.itemJsons
              const newSortData: ItemCategoryInfo[] = parentItemJson.map(item => {
                return item.itemStateDetailContent
              })
              if (newSortData.map((item) => item.id).join(',') !== config.itemCategoriesInfo.map((item) => item.id).join(',')) {
                onSettingChange({
                  id,
                  config: {
                    ...config,
                    itemCategoriesInfo: newSortData.map((item) => Immutable(item))
                  }
                })
              }
            }}
            overrideItemBlockInfo={({ itemBlockInfo }) => {
              return {
                name: TreeItemActionType.RenderOverrideItem,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDroppableContainer,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemBody,
                      children: [{
                        name: TreeItemActionType.RenderOverrideItemDragHandle
                      }, {
                        name: TreeItemActionType.RenderOverrideItemMainLine
                      }]
                    }]
                  }]
                }]
              }
            }}
            renderOverrideItemMainLine={(actionData, refComponent) => {
              const { itemJsons } = refComponent.props
              const currentItemJson = itemJsons[0]
              const listItemJsons = itemJsons[1] as any
              return createListItemElement(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
            }}
          ></List>
        </SettingRow>}
        {!config.disableAddBySearch && <SettingRow className='account-config-row'>
          <Button className='w-100 my-2' type='secondary' aria-label={translate('curateACollection')} onClick={onAddCuratedItemCategory}>
            <PlusOutlined />
            {translate('curateACollection')}
          </Button>
        </SettingRow>}
        <SettingRow className='way-of-add-data-row mt-4' label={translate('inputUrl')}>
          <Switch onChange={onAddWayChange} value='disableAddByUrl' checked={!config.disableAddByUrl} aria-label={translate('inputUrl')} />
        </SettingRow>
        <SettingRow className='way-of-add-data-row' label={translate('uploadFiles')}>
          <Switch onChange={onAddWayChange} value='disableAddByFile' checked={!config.disableAddByFile} aria-label={translate('uploadFiles')} />
        </SettingRow>
      </SettingSection>

      <SettingSection className='border-0 pt-0' role='group' title={translate('emptyListMessage')} aria-label={translate('emptyListMessage')}>
        <TextInput
          title={config.placeholderText || translate('defaultPlaceholderText')}
          aria-label={config.placeholderText || translate('defaultPlaceholderText')}
          size='sm'
          defaultValue={config.placeholderText}
          placeholder={translate('defaultPlaceholderText')}
          onAcceptValue={onPlaceholderTextChange} />
       </SettingSection>
          <SettingSection className='border-0 pt-0' role='group' title={translate('geonetApi')} aria-label={translate('geonetApi')}>
              <label >{translate('baseUrl')}
                  <TextInput
                      htmlSize="31"
                      className="sm"
                      title={config.GeonetApi.baseUrl || translate('baseUrl')}
                      aria-label={config.GeonetApi.baseUrl || translate('baseUrl')}
                      size='sm'
                      defaultValue={config.GeonetApi.baseUrl}
                      placeholder={translate('baseUrl')}
                      onAcceptValue={onGeonetApibaseUrlChange} />
              </label>
          </SettingSection>
    </div>
  )
}

export default Setting

const style = css`
  .search-config-list {
    margin-top: 0.75rem;
  }
  .way-of-add-data-section {
    .way-of-add-data-row {
      padding: 0.5rem 0.5rem 0.5rem 0.625rem;
      background-color: var(--light-400);
    }
    .account-config-row {
      margin: 0;
      padding: 0 0.5rem;
      background-color: var(--light-400);
    }
    .jimu-tree-item .jimu-tree-item__body {
      flex-wrap: nowrap;
      align-items: flex-start;
      .jimu-tree-item__drag-handle {
        margin-top: 0.5rem
      }
    }
  }
`
