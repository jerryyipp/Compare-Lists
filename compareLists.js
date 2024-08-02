import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class CompareLists extends LightningElement {
    listOne;
    listTwo;
    mf1;
    mf2;
    @track comparisonResult;
    @api product2Ids = [];

    @api
    get inputValueOne() {
        return this.listOne || [];
    }
    set inputValueOne(data) {
        this.listOne = data;
        console.log('List One populated:', JSON.stringify(this.listOne));
        this.compareListsInOne();
    }

    @api
    get inputValueTwo() {
        return this.listTwo || [];
    }
    set inputValueTwo(data) {
        this.listTwo = data;
        console.log('List Two populated:', JSON.stringify(this.listTwo));
        this.listTwo.forEach((item, index) => {
            console.log(`List Two Item ${index}:`, JSON.stringify(item));
        });
        this.compareListsInOne();
    }

    @api
    get fieldOne() {
        return this.mf1 || '';
    }
    set fieldOne(data) {
        this.mf1 = data;
        console.log('Match Fields One set:', JSON.stringify(this.mf1));
        this.compareListsInOne();
    }

    @api
    get fieldTwo() {
        return this.mf2 || '';
    }
    set fieldTwo(data) {
        this.mf2 = data;
        console.log('Match Fields Two set:', JSON.stringify(this.mf2));
        this.compareListsInOne();
    }

    compareListsInOne() {
        console.log('compareListsInOne called');
        console.log('List One:', JSON.stringify(this.listOne));
        console.log('List Two:', JSON.stringify(this.listTwo));
        console.log('Match Fields One:', JSON.stringify(this.mf1));
        console.log('Match Fields Two:', JSON.stringify(this.mf2));
    
        this.mf1 = Array.isArray(this.mf1) ? this.mf1 : [this.mf1].filter(Boolean);
        this.mf2 = Array.isArray(this.mf2) ? this.mf2 : [this.mf2].filter(Boolean);
    
        if (!Array.isArray(this.listOne) || !Array.isArray(this.listTwo) || 
            this.mf1.length === 0 || this.mf2.length === 0) {
            console.error('Invalid or missing data:', {
                listOne: Array.isArray(this.listOne),
                listTwo: Array.isArray(this.listTwo),
                mf1: this.mf1,
                mf2: this.mf2
            });
            return;
        }
    
        const getMatchValue = (item, fields) => fields.map(field => item[field] || '').join('|');
        const getMatchValueOne = (item) => getMatchValue(item, this.mf1);
        const getMatchValueTwo = (item) => getMatchValue(item, this.mf2);
    
        const uniqueListTwo = Array.from(new Set(this.listTwo.map(item => JSON.stringify(item))))
            .map(item => JSON.parse(item));
        
        const valuesInTwo = new Set(uniqueListTwo.map(getMatchValueTwo));
        const valuesInOne = new Set(this.listOne.map(getMatchValueOne));
    
        this.comparisonResult = {
            uniqueInOne: this.listOne.filter(item => !valuesInTwo.has(getMatchValueOne(item))),
            uniqueInTwo: uniqueListTwo.filter(item => !valuesInOne.has(getMatchValueTwo(item))),
            common: this.listOne.filter(item => valuesInTwo.has(getMatchValueOne(item)))
        };
    
        console.log('Comparison Result:', JSON.stringify(this.comparisonResult));

        this.extractProduct2Ids(this.comparisonResult);
        console.log('Product2Ids:', JSON.stringify(this.product2Ids)); // New console log
        this.dispatchFlowAttributeChangeEvent(this.product2Ids);
    }

    extractProduct2Ids(comparisonResult) {
        const allItems = [
            ...comparisonResult.uniqueInOne,
            ...comparisonResult.uniqueInTwo,
            ...comparisonResult.common
        ];
        this.product2Ids = allItems.map(item => item.Product__c).filter(Boolean);
        console.log('Extracted Product2Ids:', JSON.stringify(this.product2Ids)); // New console log
        return this.product2Ids;
    }

    dispatchFlowAttributeChangeEvent(product2Ids) {
        this.dispatchEvent(new FlowAttributeChangeEvent('product2Ids', product2Ids));
        console.log('Dispatched Product2Ids:', JSON.stringify(product2Ids)); // New console log
    }
}
