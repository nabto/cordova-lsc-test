const lscRpcInterface = `
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

const demoRpcInterface = `
<?xml version="1.0"?>
<unabto_queries
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="http://www.nabto.com/unabto/query_model.xsd">
  <query name="wind_speed.json" description="Measure Wind Speed" id="2">
    <request>
    </request>
    <response format="json">
      <parameter name="speed_m_s" type="uint32"/>
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
        nabto.bindToWifi(function(error) {
            if (!error) {
                invokeLocalDevice(function() {
                    nabto.clearWifiBinding(function(error) {
                        if (!error) {
                            invokeRemoteDevice("now - expect fail");
                            // invoke again a bit later
                            setTimeout(() => invokeRemoteDevice("100"), 100);
                            setTimeout(() => invokeRemoteDevice("1000"), 1000);
                            setTimeout(() => invokeRemoteDevice("5000"), 5000);
                            setTimeout(() => invokeRemoteDevice("7500"), 7500);
                            setTimeout(() => invokeRemoteDevice("7600"), 7600);
                            setTimeout(() => invokeRemoteDevice("7700"), 7700);
                        } else {
                            console.log("Failed to clear wifi binding: " + JSON.stringify(error));
                        }
                    })
                });
            } else {
                console.log("Failed to bind to wifi: " + JSON.stringify(error));
            }
        });
    });
}

function invokeLocalDevice(cb) {
    console.log("Invoking local device");
    nabto.getLocalDevices(function(error, devices) {
        console.log('Local Nabto devices: ' + JSON.stringify(devices));
        devices.forEach(function(device) {
            if (device.includes("lscontrol")) {
                console.log("Found lscontrol device '" + device + "', invoking");
                nabto.prepareInvoke([device], function() {
                    nabto.rpcSetDefaultInterface(lscRpcInterface, function() {
                        nabto.rpcInvoke('nabto://' + device + '/ping.json?ping=1885957735', function(error, result) {
                            if (!error) {
                                console.log('LSC ping result: ' + JSON.stringify(result));
                            } else {
                                console.log("LSC RPC invocation failed: " + JSON.stringify(error));
                            }
                            cb();
                        });
                    });
                });
            }
        });
    })
}

function invokeRemoteDevice(msg) {
    const demo = "demo.nabto.net";
    console.log("Invoking remote device - " + msg);
    nabto.rpcSetDefaultInterface(demoRpcInterface, function() {
        nabto.prepareInvoke([demo], function() {
            nabto.rpcSetDefaultInterface(demoRpcInterface, function() {
                nabto.rpcInvoke('nabto://' + demo + '/wind_speed.json?', function(error, result) {
                    if (!error) {
                        console.log('Demo result [' + msg + ']: ' + JSON.stringify(result));
                    } else {
                        console.log('Demo RPC invocation failed [' + msg + ']: ' + JSON.stringify(error));
                    }
                });
            });
        });
    });
}
