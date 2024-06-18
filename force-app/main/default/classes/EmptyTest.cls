@IsTest
public class EmptyTest{
    @TestSetup
    static void sampleData(){
        Empty.emptyClass();
    }
    @IsTest
    static void emptyTest(){
        List<Account> accList = [SELECT Id from Account];
        Assert.areEqual(1,accList.size());
    }
}