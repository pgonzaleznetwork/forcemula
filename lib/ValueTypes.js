module.exports = class ValueType {

    static CUSTOM_FIELD = new ValueType("CUSTOM_FIELD")
    static STANDARD_FIELD = new ValueType("STANDARD_FIELD")
    static CUSTOM_LABEL = new ValueType("CUSTOM_LABEL")
    static CUSTOM_SETTING = new ValueType("CUSTOM_SETTING")
    static CUSTOM_METADATA_TYPE = new ValueType("CUSTOM_METADATA_TYPE")

    constructor(name) {
        this.name = name
    }

}