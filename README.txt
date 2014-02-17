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
  2.Download Code (https://github.com/GalaxyProgramming/SynergyCode/archive/master.zip)
  3.Extract and open the directory
  4.Run the command "npm install" from command prompt or run "install.bat"
  5.Run the command "node app" from command prompt or run "run.bat"
     -Note: To exit type "Ctrl+C" 
  6.Open IIS and create a new website with any domain you have access to
    -Set port to "3000"
  7.Test at http://yourdomain.com:3000/
  
Note: this requires a preinstalled and functioning windows server with a website and port 3000 unblocked from your ISP.

For more information refer to the wiki: http://www.wiki.synergycode.org/index.php?title=Main_Page
