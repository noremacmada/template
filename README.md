This code is an exercise in server routing an authentication,
mixed with an angular 1.6 app builder

todo:
1. data folder stores all data in memory, and will need to use a db client for proper persistence
2. better hiding of session id
3. form data parsing
4. configurable dir for ngapp
5. configurable dir for public content

configuring a handler:
handlers must exist in the folder /app/server/handlers
handlers should extend the default handlers
handler constructors must pass a response object to the default handler constructors
any property of a handler that is enumerable will form part of a valid route
routes can be overridden in routes.js


configuring an ng app:
1. angular services must be defined in the app/client/ngapp/services
  1.a. the filename of the service must be: ${service}Service.js
  1.b. the function of the service defined in ${service}Service.js must be named: ${Service}Service
2. angular component must be defined in a subdirectory of the app/client/ngapps/components and that subdirectory must be named app/client/components/${component}
  2.a the subdirectory app/client/ngapp/components/${component} must contain files ${component}Bindings.json, ${component}Controller.js, and ${component}Template.html
  2.b. the function of the service defined in ${component}Controller.js must be named: ${Component}Controller
3. angular apps are assembled when the file Handler include method is called with the parameter: "app" where the value of the app parameter must correspond to a file in the app/client/ngapp/apps/${appname}.json

public content:
public content must exist under the directory app/client/public/content
