const rpcInterface = `
<?xml version="1.0"?>
<unabto_queries
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.nabto.com/unabto/query_model.xsd">
  <!-- New format of requests -->
  <!-- Ping query -->
  <query id="17" description="Ping" name="ping.json">
    <request>
      <parameter name="ping" type="uint32" />
      <!--Always = 0x70696E67 -->
    </request>
    <response format="json">
      <parameter name="Pong" type="uint32" />
      <!-- Always = 0x706F6E67-->
      <parameter name="Devicenumber" type="uint32" />
      <parameter name="Model" type="uint32" />
      <parameter name="Version" type="uint32" />
                        <parameter name="SlaveDevicenumber" type="uint32" />
                        <parameter name="SlaveModel" type="uint32" />
                        <parameter name="UserNames:" type="raw"  />
    </response>
  </query>
</unabto_queries>`;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    runNabtoTest();
}

function runNabtoTest() {
    nabto.startupAndOpenProfile(function(error) {
        nabto.version(function(error, version) {
            console.log('Nabto SDK available: ' + version);
        });
        nabto.getLocalDevices(function(error, devices) {
            console.log('Local Nabto devices: ' + JSON.stringify(devices));
            devices.forEach(function(device) {
                if (device.includes("lscontrol")) {
                    console.log("Found lscontrol device '" + device + "', invoking");
                    nabto.prepareInvoke([device], function() {
                        nabto.rpcSetDefaultInterface(rpcInterface, function() {
                            nabto.rpcInvoke('nabto://' + device + '/ping.json?ping=1885957735', function(error, result) {
                                if (!error) {
                                    console.log('Ping result: ' + JSON.stringify(result));
                                } else {
                                    console.log("RPC invocation failed: " + JSON.stringify(error));
                                }
                            });
                        });
                    });
                }
            });
        });
    });
}
