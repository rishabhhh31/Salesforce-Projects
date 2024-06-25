import LightningDatatable from "lightning/datatable";
import customNameTemplate from "./customName.html";
import customRankTemplate from "./customRank.html";
import customImageTemplate from "./customImage.html";
import customPicklistTemplate from "./customPicklist.html";
import customPicklistEditTemplate from "./customPicklistEdit.html";

export default class CustomDataType extends LightningDatatable {
    static customTypes = {
        customName: {
            template: customNameTemplate,
            standardCellLayout: true,
            typeAttributes: ["contactName"],
        },
        customRank: {
            template: customRankTemplate,
            standardCellLayout: false,
            typeAttributes: ["rankIcon"],
        },
        customImage: {
            template: customImageTemplate,
            standardCellLayout: false,
            typeAttributes: ["contactPicture"],
        },
        customPicklistType: {
            template: customPicklistTemplate,
            standardCellLayout: true,
            editTemplate: customPicklistEditTemplate,
            typeAttributes: ["options"],

        }
    }
}