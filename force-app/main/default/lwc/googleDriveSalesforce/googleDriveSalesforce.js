import { LightningElement, wire } from 'lwc';
import getFiles from '@salesforce/apex/GoogleDrive.getFiles';
import deleteFile from '@salesforce/apex/GoogleDrive.deleteFile';
import createFile from '@salesforce/apex/GoogleDrive.createFile';
import getFileDetails from '@salesforce/apex/GoogleDrive.getFileDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
const actions = [
    { label: 'View', name: 'view' },
    { label: 'Download', name: 'download' },
    { label: 'Delete', name: 'delete' }
];
const COLUMN = [
    { label: 'File Name', fieldName: 'name' },
    { label: 'File Id', fieldName: 'id' },
    { label: 'mime Type', fieldName: 'mimeType' },
    { type: 'action', typeAttributes: { rowActions: actions, menuAlignment: 'auto' } }
]
export default class GoogleDriveSalesforce extends LightningElement {
    columns = COLUMN;
    isLoading = false;
    driveFiles = [];
    driveData;
    fileData = {
        fileName: '',
        fileBody: '',
        fileType: ''
    }

    fileUploadName = '';

    @wire(getFiles)
    wireDriveFiles(result) {
        this.driveData = result;
        if (result.data) {
            let allFiles = JSON.parse(result.data);
            this.driveFiles = allFiles.files;
        } else if (result.error) {
            console.log('error:', result.error);
        }
    }

    get cardTitle() {
        return `Google Drive(${this.driveFiles?.length})`;
    }

    get tableStyle() {
        return this.driveFiles?.length > 8 ? 'height:250px' : '';
    }

    async handleRowAction(event) {
        let action = event.detail.action.name;
        let row = event.detail.row;
        if (action == 'download') {
            this.isLoading = true;
            let a = document.createElement("a");
            a.href = row.webContentLink;
            a.download = row.name;
            a.target = '_self';
            document.body.appendChild(a);
            a.click();
            this.isLoading = false;
        } else if (action == 'delete') {
            this.deleteFileHandler(row.id);
        } else if (action == 'view') {
            window.open(row.webViewLink, '_blank')
        }
    }

    async deleteFileHandler(fileId) {
        let response = await deleteFile({ fileId: fileId });
        if (response.success) {
            await refreshApex(this.driveData);
            this.showToast('Success', response.message, 'success')

        } else {
            this.showToast('Error', response.message, 'error')
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title, variant, message
        });
        this.dispatchEvent(evt);
    }

    get fileBadgeName() {
        return this.fileUploadName;
    }

    get showBadges() {
        return this.fileUploadName != '';
    }
    fileUploadHandler(event) {
        let files = [...event.detail.files];
        if (files.length == 0) {
            this.fileUploadName = '';
        }
        files.forEach(f => {
            this.fileUploadName = f.name;
            const fileReader = new FileReader();
            fileReader.onloadend = async () => {
                this.fileData.fileBody = fileReader.result.split(',')[1];
                this.fileData.fileName = f.name;
                this.fileData.fileType = f.type;
            };
            fileReader.readAsDataURL(f);
        });
    }

    async uploadFile() {
        if (!this.showBadges) {
            this.showToast('Please select a file to upload', '', 'error');
            return;
        }
        try {
            this.isLoading = true;
            let response = await createFile({ fileName: this.fileData.fileName, fileBody: this.fileData.fileBody, fileType: this.fileData.fileType })
            let data = JSON.parse(response);
            if (data.id) {
                await refreshApex(this.driveData);
                this.fileUploadName = '';
                this.showToast('File Uploaded Successfully', '', 'success');
            } else {
                this.showToast('Something went wrong', '', 'error');
            }
            this.isLoading = false;
        } catch (error) {
            this.showToast(error.body.message, '', 'error');
            this.isLoading = false;
        }
    }
}