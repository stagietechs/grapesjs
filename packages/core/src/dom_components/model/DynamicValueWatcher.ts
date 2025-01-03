import { DynamicValueDefinition } from './../../data_sources/types';
import { CollectionsStateMap } from '../../data_sources/model/collection_component/types';
import { ObjectAny } from '../../common';
import DynamicVariableListenerManager from '../../data_sources/model/DataVariableListenerManager';
import { evaluateDynamicValueDefinition, isDynamicValueDefinition } from '../../data_sources/model/utils';
import { DynamicValue } from '../../data_sources/types';
import EditorModel from '../../editor/model/Editor';
import Component from './Component';
import CollectionVariable from '../../data_sources/model/collection_component/CollectionVariable';

export interface DynamicWatchersOptions {
  skipWatcherUpdates?: boolean;
  fromDataSource?: boolean;
}

export class DynamicValueWatcher {
  private dynamicVariableListeners: { [key: string]: DynamicVariableListenerManager } = {};
  constructor(
    private component: Component | undefined,
    private updateFn: (component: Component | undefined, key: string, value: any) => void,
    private options: {
      em: EditorModel;
      collectionsStateMap?: CollectionsStateMap;
    },
  ) {}

  bindComponent(component: Component) {
    this.component = component;
  }

  setDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.removeListeners();
    }

    return this.addDynamicValues(values, options);
  }

  addDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    if (!values) return {};
    const { evaluatedValues, dynamicValues } = this.evaluateValues(values);

    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.updateListeners(dynamicValues);
    }

    return evaluatedValues;
  }

  private updateListeners(dynamicProps: { [key: string]: DynamicValue }) {
    const em = this.options.em;
    this.removeListeners(Object.keys(dynamicProps));
    const propsKeys = Object.keys(dynamicProps);
    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      this.dynamicVariableListeners[key] = new DynamicVariableListenerManager({
        em: em,
        dataVariable: dynamicProps[key],
        updateValueFromDataVariable: (value: any) => {
          this.updateFn.bind(this)(this.component, key, value);
        },
      });
    }
  }

  private evaluateValues(values: ObjectAny) {
    const dynamicValues: {
      [key: string]: DynamicValue;
    } = {};
    const evaluatedValues: {
      [key: string]: any;
    } = { ...values };
    const valuesToBeOverriden: string[] = [];
    const propsKeys = Object.keys(values);
    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      if (!isDynamicValueDefinition(values[key])) {
        continue;
      }
      const { value, variable } = evaluateDynamicValueDefinition(values[key], this.options);
      evaluatedValues[key] = value;
      dynamicValues[key] = variable;
      if (variable instanceof CollectionVariable) {
        valuesToBeOverriden.push(key);
      }
    }

    return { evaluatedValues, dynamicValues, valuesToBeOverriden };
  }

  /**
   * removes listeners to stop watching for changes,
   * if keys argument is omitted, remove all listeners
   * @argument keys
   */
  removeListeners(keys?: string[]) {
    const propsKeys = keys ? keys : Object.keys(this.dynamicVariableListeners);
    propsKeys.forEach((key) => {
      if (this.dynamicVariableListeners[key]) {
        this.dynamicVariableListeners[key].destroy();
        delete this.dynamicVariableListeners[key];
      }
    });

    return propsKeys;
  }

  getSerializableValues(values: ObjectAny | undefined) {
    if (!values) return {};
    const serializableValues = { ...values };
    const propsKeys = Object.keys(serializableValues);
    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      if (this.dynamicVariableListeners[key]) {
        serializableValues[key] = this.dynamicVariableListeners[key].dynamicVariable.toJSON();
      }
    }

    return serializableValues;
  }

  getAllSerializableValues() {
    const serializableValues: ObjectAny = {};
    const propsKeys = Object.keys(this.dynamicVariableListeners);
    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      serializableValues[key] = this.dynamicVariableListeners[key].dynamicVariable.toJSON();
    }

    return serializableValues;
  }

  getDynamicValuesOfType(type: DynamicValueDefinition['type']) {
    const keys = Object.keys(this.dynamicVariableListeners).filter((key: string) => {
      // @ts-ignore
      return this.dynamicVariableListeners[key].dynamicVariable.get('type') === type;
    });

    return keys;
  }
}
