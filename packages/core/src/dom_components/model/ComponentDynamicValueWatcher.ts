import { ObjectAny } from '../../common';
import { CollectionVariableType } from '../../data_sources/model/collection_component/constants';
import { CollectionsStateMap } from '../../data_sources/model/collection_component/types';
import EditorModel from '../../editor/model/Editor';
import Component from './Component';
import { DynamicWatchersOptions } from './DynamicValueWatcher';
import { DynamicValueWatcher } from './DynamicValueWatcher';

export class ComponentDynamicValueWatcher {
  private propertyWatcher: DynamicValueWatcher;
  private attributeWatcher: DynamicValueWatcher;

  constructor(
    private component: Component | undefined,
    options: {
      em: EditorModel;
      collectionsStateMap: CollectionsStateMap;
    },
  ) {
    this.propertyWatcher = new DynamicValueWatcher(component, this.createPropertyUpdater(), options);
    this.attributeWatcher = new DynamicValueWatcher(component, this.createAttributeUpdater(), options);
  }

  private createPropertyUpdater() {
    return (component: Component | undefined, key: string, value: any) => {
      if (!component) return;
      component.set(key, value, { fromDataSource: true, avoidStore: true });
    };
  }

  private createAttributeUpdater() {
    return (component: Component | undefined, key: string, value: any) => {
      if (!component) return;
      component.addAttributes({ [key]: value }, { fromDataSource: true, avoidStore: true });
    };
  }

  bindComponent(component: Component) {
    this.component = component;
    this.propertyWatcher.bindComponent(component);
    this.attributeWatcher.bindComponent(component);
    this.updateSymbolOverride();
  }

  addProps(props: ObjectAny, options: DynamicWatchersOptions = {}) {
    const evaluatedProps = this.propertyWatcher.addDynamicValues(props, options);
    const shouldSkipOverridUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipOverridUpdates) {
      this.updateSymbolOverride();
    }

    return evaluatedProps;
  }

  addAttributes(attributes: ObjectAny, options: DynamicWatchersOptions = {}) {
    const evaluatedAttributes = this.attributeWatcher.addDynamicValues(attributes, options);
    this.updateSymbolOverride();
    return evaluatedAttributes;
  }

  setAttributes(attributes: ObjectAny, options: DynamicWatchersOptions = {}) {
    const evaluatedAttributes = this.attributeWatcher.setDynamicValues(attributes, options);
    this.updateSymbolOverride();
    return evaluatedAttributes;
  }

  removeAttributes(attributes: string[]) {
    this.attributeWatcher.removeListeners(attributes);
    this.updateSymbolOverride();
  }

  updateSymbolOverride() {
    if (!this.component) return;

    const keys = this.propertyWatcher.getDynamicValuesOfType(CollectionVariableType);
    const attributesKeys = this.attributeWatcher.getDynamicValuesOfType(CollectionVariableType);

    const combinedKeys = [...keys];
    const haveOverridenAttributes = Object.keys(attributesKeys).length;
    if (haveOverridenAttributes) combinedKeys.push('attributes');

    if (!combinedKeys.length && !this.component.getSymbolOverride()) return;
    this.component.setSymbolOverride(combinedKeys, { fromDataSource: true });
  }

  getDynamicPropsDefs() {
    return this.propertyWatcher.getAllSerializableValues();
  }

  getDynamicAttributesDefs() {
    return this.attributeWatcher.getAllSerializableValues();
  }

  getAttributesDefsOrValues(attributes: ObjectAny) {
    return this.attributeWatcher.getSerializableValues(attributes);
  }

  destroy() {
    this.propertyWatcher.removeListeners();
    this.attributeWatcher.removeListeners();
  }
}
