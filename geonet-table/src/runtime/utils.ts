import {
  type DataSource,
  dataSourceUtils,
  type IMThemeVariables,
  type SerializedStyles,
  css
} from 'jimu-core'
import { type LayersConfig, type Suggestion } from '../config'

export async function fetchSuggestionRecords (
  searchText: string,
  config: LayersConfig,
  datasource: DataSource
): Promise<Suggestion[]> {
  const option = {
    searchText,
    searchFields: config?.searchFields || [],
    dataSource: datasource,
    exact: config?.searchExact
  }
  return dataSourceUtils.querySuggestions(option)
}

export function minusArray (array1, array2, key?: string) {
  const keyField = key || 'jimuName'
  const lengthFlag = array1.length > array2.length
  const arr1 = lengthFlag ? array1 : array2
  const arr2 = lengthFlag ? array2 : array1
  return arr1.filter(item => {
    const hasField = arr2.some(ele => {
      return ele?.[keyField] === item?.[keyField]
    })
    return !hasField
  })
}

export function getGlobalTableTools (theme: IMThemeVariables): SerializedStyles {
  return css`
    .esri-button-menu__item .esri-button-menu__item-label{
      padding: 4px 15px !important;
    }
    .table-popup-search{
      .search-icon{
        z-index: 2;
      }
      .popup-search-input{
        border: 1px solid ${theme.colors.palette.light[400]};
        border-radius: 2px;
        .input-wrapper{
          height: 30px;
          border: none;
        }
      }
    }
    .table-action-option{
      width: 100%;
      display: inline-flex;
      flex-direction: row;
      .table-action-option-tab{
        margin: auto 8px;
      }
      .table-action-option-close{
        flex: 1;
        button{
          :hover {
            color: ${theme.colors.white};
          }
          float: right;
        }
      }
    }
    .esri-popover--open{
      z-index: 1005 !important;
      .esri-date-picker__calendar{
        background-color: ${theme.colors.white};
      }
    }
    .table-hide-hover-color{
      color: unset !important;
      border: none !important;
      &:hover{
        color: unset !important; /* use color of dropdown item */
      }
    }
  `
}
