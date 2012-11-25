$().ns('RadianApp.Configuration');

$(document).ready(function () {
    RadianApp.Configuration.isIOS = function () {
          return device.platform === "iPhone";
    }
});