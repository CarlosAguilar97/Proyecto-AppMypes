const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MySQLAdapter = require('@bot-whatsapp/database/mock')

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = 'aws.connect.psdb.cloud'
const MYSQL_DB_USER = 'okwlneaxb9rr2u8rkpee'
const MYSQL_DB_PASSWORD = 'pscale_pw_JzMoahNNUYXe8fMMDyY9s8NTvsIV02dyD7hPIKwsG5r'
const MYSQL_DB_NAME = 'nfc'
const MYSQL_DB_PORT = '3306'


async function verificarDNI(dni){
    const response = await fetch(`https://api.apis.net.pe/v1/dni?numero=${dni}`) 
    if(response.status == 200){
        const data = await response.json()
        return `Hola ,${data.nombre} en estos momentos le asignaremos un asesor para que pueda realizar su consulta`
    }else{
        return `Los datos no se han podido verificar, por favor vuelva a intentarlo`
    }

}
/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

    /*Mensaje Inicial 01*/
    const flow01 = addKeyword(['hola', 'alo', 'Hola', 'Alo', 'HOLA', 'ALO'])
    .addAnswer(['Hola, bienvenido a Chat Bot de Mi Banco', '¿Como puedo ayudarte?'])
    .addAnswer(['Estos son mis servicios:', '1 Analista Online','2 Credito Mype', '3 Credito Pyme', '4 Credito Empresarial', '5 Credito Corporativo'])
    .addAnswer(['Digitame un numero para poder ayudarte:'])

     /*Mensaje Inicial 02*/
     let nrodni = 0
     const flow02 = addKeyword(['1'])
     .addAnswer(
        'Has seleccionado Analista Online \n Permiteme verficar tus datos... \n ¿Cual es el numero de tu DNI?',
        null,
        async (ctx, { flowDynamic, state }) => {
            await state.update({ dni: ctx.body })
            const myState = state.getMyState()
            nrodni = myState.dni
           
        }
        
    )
    .addAnswer('Resultado de Busqueda:', async (ctx, { flowDynamic, state }) => {
        const response = verificarDNI(nrodni)
        await flowDynamic(response)
    })
    .addAnswer('Este sera el analista a cargo...', {
        media: 'https://img.freepik.com/vector-premium/ilustracion-vector-estilo-diseno-plano-tarjeta-identificacion_545399-1236.jpg?size=626&ext=jpg'    })
   

const main = async () => {
    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flow01, flow02])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
