public with sharing class pdfGenterateController {
    
        @AuraEnabled
    public static List<Contact> pdfGenterateController(String recordId){
        return [SELECT Id,LastName FROM Contact where Id=:recordId];
        
    }
    @AuraEnabled(cacheable=true)
    public static Account getAccountWithContacts(Id accountId) {
        return [SELECT Id, Name, (SELECT Id, FirstName, LastName, Email FROM Contacts) 
                FROM Account 
                WHERE Id = :accountId ];
    }
    
}
