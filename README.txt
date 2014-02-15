Thank you for downloading SynergyCode!
Version: 0.0.2
Main website: http://www.synergycode.org/
Wiki: http://www.wiki.synergycode.org/index.php
Forum: http://www.synergycode.org/forms/

---------------------------
Instructions
---------------------------

-Ubuntu Server
  1.Install Node: "sudo apt-get install nodejs"
  2.Install MongoDB: "sudo apt-get install mongodb-10gen"
  3.Move to directory: "cd ~/var/"
  4.Create Synergy folder: "sudo mkdir synergy"
  5.Move into folder: "cd synergy"
  6.Download Code: "sudo wget https://github.com/GalaxyProgramming/SynergyCode/archive/master.zip"
  7.Unzip: "unzip synergycode.zip"
  8.Run the command "npm install"
  9.Run the command "node app"
    -Note: To exit type "Ctrl+C"
 10.Test at http://yourdomain.com:3000/
  
Note: this requires a preinstalled and functioning ubuntu server with LAMP and port 3000 unblocked from your ISP.

-Windows Server
  1.Install Node (http://nodejs.org/dist/v0.10.25/node-v0.10.25-x86.msi)
  2.Install MongoDB (http://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-2.4.9.zip)
  3.Download Code (https://github.com/GalaxyProgramming/SynergyCode/archive/master.zip)
  4.Open directory and run "install.cmd"
  5.Run the command "npm install" from command prompt
  6.Run the command "node app" from command prompt
     -Note: To exit type "Ctrl+C" 
  7.Open IIS and create a new website with any domain you have access to
    -Set port to "3000"
  8.Test at http://yourdomain.com:3000/
  
Note: this requires a preinstalled and functioning windows server with a website and port 3000 unblocked from your ISP.

For more information refer to the wiki: http://www.wiki.synergycode.org/index.php?title=Main_Page
