const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connFactory = require("./connection/connFactory.js");

/**
 * If you are running front end in stand alone mode
 */
const runningStandAlone = false;

const cors = require('cors');
if (runningStandAlone) {
    console.log("! ! ! ! ! ! STAND ALONE MODE");
    app.use(cors("*"))
} else {
    app.use(cors())
}

// Precisa fazer if para identificar ambientes...

const vcapServices = require('vcap_services');
const credentials = vcapServices.getCredentials('cloudantNoSQLDB');


let params = {
    "username": "96ba32ad-e17d-494f-a93e-72240b1e0b16-bluemix",
    "host": "96ba32ad-e17d-494f-a93e-72240b1e0b16-bluemix.cloudant.com",
    "dbname": "hackathon-quero",
    "password": "e373c010bcb53c3ea89a59f7fa2642789e7bfe3128bab1c3e2762b713ab04641"
};


app.get('/info', function (req, res) {
    console.log("GET /info");

    let query = {
        selector: {

        }
    };

    let request = connFactory.getDocument(params, query)
    request.then(function (result) {

        let dataResponse = process(result);
        dataResponse.then(function (data) {
            res.send(data);
        })
    })
});

function process(data) {
    return new Promise(function (resolve, reject) {

        let cursos = [];
        let alunos = [];

        if (data != undefined) {
            for (let item of data) {
                if (item.type == "CURSO") {
                    cursos.push(item);
                } else if (item.type == "ALUNO") {
                    alunos.push(item);
                }
            }
        }

        let response = {};

        // preco
        // curso
        // faculdade

        for (let curso of cursos) {
            response[curso.estado] == undefined ? response[curso.estado] = {} : response[curso.estado];
            response[curso.estado][curso.cidade] == undefined ? response[curso.estado][curso.cidade] = {} : response[curso.estado][curso.cidade];
            response[curso.estado][curso.cidade][curso.regiao] == undefined ? response[curso.estado][curso.cidade][curso.regiao] = {} : response[curso.estado][curso.cidade][curso.regiao];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade];

            let aluno = {};

            for (let itemAluno of alunos) {
                if (itemAluno.curso == curso._id) {
                    response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre];

                    aluno = itemAluno;

                    let arrayAlunos = [];
                    let notaIDD;
                    let notaEnade;
                    let notaInfraestrutura;
                    let notaODP;
                    let notaAmpliacao;
                    let notaCurso;
                    let satisfacao;
                    if (response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"] != undefined) {
                        arrayAlunos = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["alunos"];
                        arrayAlunos.push(aluno);


                        notaIDD = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaIDD"] + itemAluno.notaIDD;
                        notaEnade = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaEnade"] + itemAluno.notaEnade;
                        notaInfraestrutura = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaInfraestrutura"] + itemAluno.notaInfraestrutura;
                        notaODP = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaODP"] + itemAluno.notaODP;
                        notaAmpliacao = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaAmpliacao"] + itemAluno.notaAmpliacao;
                        notaCurso = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["notaCurso"] + itemAluno.notaCurso;
                        satisfacao = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"]["satisfacao"] + itemAluno.satisfacao;

                    }

                    response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][curso.faculdade][itemAluno.semestre]["info"] = {
                        idCurso: curso._id,
                        alunos: arrayAlunos,
                        notaIDD: notaIDD,
                        notaEnade: notaEnade,
                        notaInfraestrutura: notaInfraestrutura,
                        notaODP: notaODP,
                        notaAmpliacao: notaAmpliacao,
                        notaCurso: notaCurso,
                        satisfacao: satisfacao
                    }


                }
            }


        }





        resolve(response);
    });
}


var port = 3000;
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
