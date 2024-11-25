import { LightningElement,api,track } from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import jsPDF from '@salesforce/resourceUrl/jsPDF';
import autoTable from '@salesforce/resourceUrl/autoTable';
import getContacts from '@salesforce/apex/pdfGenterateController.pdfGenterateController';
import getAccountWithContacts from '@salesforce/apex/pdfGenterateController.getAccountWithContacts';

export default class PdfGenerate extends LightningElement {
    @track account;
    @track error;
    @track accountId = '';
    isJsPdfLoaded = false;

    @track selectedFormat='pdf';
    @track formatOptions = [
        { label: 'PDF', value: 'pdf' },
        { label: 'Excel', value: 'excel' }];

        @track columnHeading=[
            {label:'FirstName',key:'FirstName'},
            {label:'LastName',key:'LastName'},
            {label:'Email',key:'Email'}
        ]

    // Load jsPDF and AutoTable resources
    renderedCallback() {
        if (this.isJsPdfLoaded) {
            return;
        }
        Promise.all([
            loadScript(this, jsPDF),
            loadScript(this, autoTable)
        ])
        .then(() => {
            this.isJsPdfLoaded = true;
        })
        .catch((error) => {
            console.error('Error loading jsPDF or AutoTable:', error);
        });
    }

    handleInputChange(event) {
        this.accountId = event.target.value;
        this.fetchAccountData();
    }

    fetchAccountData() {
        if (this.accountId) {
            getAccountWithContacts({ accountId: this.accountId })
                .then((result) => {
                    this.account = result;
                    
                    const r=Object.keys(this.account.Contacts);
                    console.log('keys',JSON.stringify(r));
                    console.log('Account',JSON.stringify(this.account.Contacts));
                    console.log('Contact',JSON.parse(JSON.stringify(this.account.Contacts)));
                    
                    this.error = undefined;
                    debugger;
                })
                .catch((error) => {
                    this.error = error.body.message;
                    this.account = undefined;
                });
        }
    }
    handleFormatChange(event){
        this.selectedFormat=event.target.value;
    }
    downloadFile(){
        if(this.selectedFormat === 'pdf'){
            this.downloadPdf();
        }
        else if(this.selectedFormat === 'excel'){
            console.log('exel',this.selectedFormat);
            
            this.downloadExcel();
        }
    }

    downloadPdf() {
        console.log('inside');
        
        // if (!this.isJsPdfLoaded) {
        //     console.error('jsPDF or AutoTable libraries not loaded');
        //     return;
        // }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const table = this.template.querySelector('table');
        doc.setFontSize(14);
        doc.text(`Account Name: ${this.account.Name}`, 15,10);

        const contacts = this.account.Contacts.map((contact) => [
            contact.FirstName,
            contact.LastName,
            contact.Email
        ]);

        doc.autoTable({
          // head: [['First Name', 'Last Name', 'Email']],
         //  body: contacts,
            html:table,
            theme:'grid',
            styles:{
                halign:'center',
                valign:'middle',
                cellPadding:5,
                fontSize:10,
                overFlow:'linebreak',
            tablewidth:'50px',
            
            
            },
            headStyles:{
               
                textColor: [0,0,0],
                lineColor: [0, 0, 0],
                lineWidth: 0.2,
            },
            
            bodyStyles:{
                
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.2,
            }
            
                           
        });

        doc.save(`${this.account.Name}_Contacts.pdf`);
    }
    downloadExcel() {
        console.log('inside excel fun');
        const hdr=['Name','Age','Position'];
        const cHeader=this.columnHeading.map(hd => [hd.label]);
        console.log('chead',JSON.stringify(cHeader));
    
        let chd=cHeader.toString()
        console.log('chd',chd);
        
        const rows=this.account.Contacts.map(row => [row.FirstName,row.LastName,row.Email]);
        console.log('r',JSON.stringify(rows));
    
        
        let cvsContent=chd + '\n' + rows.map(e => e.join(',')).join('\n');
        console.log('c',cvsContent);
    
        console.log('ch',chd + '\n' + rows.map(e => e.join(',')).join('\n'));
        
    
        const downLink=document.createElement("a");
                downLink.href="data:text/plain;charset=utf-8,"+ encodeURI(cvsContent);
                downLink.target='_blank'; 
                downLink.download=this.account.Name+'_Contacts.csv';
                downLink.click()

}
}
