public class GoogleDrive {
	@AuraEnabled(cacheable=true)
    public static String getFiles(){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:NamedDrive/files?fields=files(id,name,webViewLink,mimeType,webContentLink,parents)&supportsAllDrives=true&orderBy=name');
        req.setMethod('GET');
        HttpResponse res = new Http().send(req);
        return res.getBody();
    }
    
	@AuraEnabled
    public static Map<String,Object> deleteFile(String fileId){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:NamedDrive/files/'+fileId);
        req.setMethod('DELETE');
        HttpResponse res = new Http().send(req);
        Map<String,Object> response = new Map<String,Object>();
        System.debug(res.getBody());
        if(res.getStatusCode() == 204){
            response.put('success',true);
            response.put('message','File Deleted Successfully.');
        }else if(res.getStatusCode() == 403){
            Map<String,Object> errorMessage = (Map<String,Object>)JSON.deserializeUntyped(res.getBody());
            Map<String, Object> errorMap = (Map<String,Object>) errorMessage.get('error');
            response.put('success',false);
            response.put('message',errorMap.get('message'));
        }
        return response;
    }
    
    @AuraEnabled
    public static Blob getFileDetails(String fileId){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:NamedDrive/files/'+fileId+'?alt=media&mimeType=application/pdf');
        req.setMethod('GET');
        req.setTimeout(120000);
        HttpResponse res = new Http().send(req);
        System.debug(res.getBody());
        return res.getBodyAsBlob();
    }
    
    @AuraEnabled
    public static String createFile(String fileName,String fileBody, String fileType){
        Blob fileBlob = EncodingUtil.base64Decode(fileBody);
        Map<String, Object> metadata = new Map<String, Object>();
        metadata.put('name', fileName);
        metadata.put('mimeType', fileType);
        String boundary = '------WebKitFormBoundaryxX0XmxgooMjdUECR';
        String delimiter = '\r\n--' + boundary + '\r\n';
        String closeDelimiter = '\r\n--' + boundary + '--';
        String metadataPart = delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.serialize(metadata);
        String filePart = delimiter +
            'Content-Type: ' + fileType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            EncodingUtil.base64Encode(fileBlob);
        String body = metadataPart + filePart + closeDelimiter;
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:UploadDrive/files?uploadType=multipart&fields=id');
        req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
        req.setMethod('POST');
        req.setBody(body);
        req.setTimeout(120000);
        HttpResponse res = new http().send(req);
        System.debug(res.getBody());
        return res.getBody();
    }
}