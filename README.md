# quickstartofflineplugin
Repository for the Salesforce CLI Quickstart Offline Mobile Plugin from my Dreamforce 2018 Theatre Session

# Getting started
I've intentionally not included all the artifacts created by the Salesforce CLI plugin generator, as it will
have moved on by the time I give my talk. To use this example code:
1. create a new plugin as detailed at:
https://github.com/forcedotcom/sfdx-plugin-generate/blob/master/README.md 
2. Copy the commands/hello/org.ts file to commands/quickstart/offline.ts
3. Replace the contents of offline.ts with the code from this repo - note that as the plugin structure is likely to have changed in 
meantime you will likely need to tweak the code.
4. Copy the templates directory from this repo to the top level directory of the new plugin

Then just link the plugin and away you go!
