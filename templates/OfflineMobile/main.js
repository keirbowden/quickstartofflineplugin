function Main()
{
    console.log('Instantiated main class');
    /* Do login */
    force.login(
                function() {
                console.log("Auth succeeded");
                //showUsersList();
                main.initialise();
                },
                function(error) {
                console.log("Auth failed: " + error);
                }
                );
    
}

Main.prototype.initialise=function() {
    try
    {
        // Initialize app
        myApp = new Framework7();
        
        // If we need to use custom DOM library, let's save it to $$ variable:
        $$ = Dom7;
        
        myApp.showPreloader('Setting up store');
        
        // Add view
        mainView = myApp.addView('.view-main', {
                                 // Because we want to use dynamic navbar, we need to enable it for this view:
                                 dynamicNavbar: true,
                                 // Enable Dom Cache so we can use all inline pages
                                 domCache: true
                                 });
        
    }
    catch (e)
    {
        console.log(e);
        alert('exception ' + e + ', stack = ' + e.stack);
    }
}

Main.prototype.setupSmartstore=function() {
    if (!navigator.smartstore) {
        console.log('Smartstore undefined - trying again in 2 seconds');
        var self=this;
        setTimeout(function() { self.setupSmartstore(); }, 2000);
        return;
    }
    else {
        this.storeCreated();
    }
}

Main.prototype.storeCreated=function() {
    console.log('Store created!');
    var indexSpecs=[
                    {"path":"Name", "type":"string"},
                    {"path":"Id","type":"string"}
                    ];
    
    var self=this;
    navigator.smartstore.registerSoup('records', indexSpecs, self.soupCreated, self.error);
}

Main.prototype.soupCreated = function() {
    console.log('Soup created');
    myApp.hidePreloader();
    ui.showAllRecords();
}



Main.prototype.error=function(err) {
    alert('Error occurred ' + err);
}
