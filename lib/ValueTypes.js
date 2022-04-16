module.exports = class ValueType {

    static CUSTOM_FIELD = new ValueType("customFields")
    static STANDARD_FIELD = new ValueType("standardFields")
    static CUSTOM_OBJECT = new ValueType("customObjects")
    static STANDARD_OBJECT = new ValueType("standardObjects")
    static CUSTOM_LABEL = new ValueType("customLabels")
    static CUSTOM_SETTING = new ValueType("customSettings")
    static CUSTOM_METADATA_TYPE_RECORD = new ValueType("customMetadataTypeRecords")
    static CUSTOM_METADATA_TYPE = new ValueType("customMetadataTypes")

    constructor(name) {
        this.name = name
    }

}