const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connFactory = require("./connection/connFactory.js");

const cors = require('cors');
app.use(cors("*"))

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

        for (let curso of cursos) {
            response[curso.estado] == undefined ? response[curso.estado] = {} : response[curso.estado];
            response[curso.estado][curso.cidade] == undefined ? response[curso.estado][curso.cidade] = {} : response[curso.estado][curso.cidade];
            response[curso.estado][curso.cidade][curso.regiao] == undefined ? response[curso.estado][curso.cidade][curso.regiao] = {} : response[curso.estado][curso.cidade][curso.regiao];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso];
            response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco];

            let aluno = {};

            for (let itemAluno of alunos) {
                if (itemAluno.curso == curso._id) {
                    response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre];
                    response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade] == undefined ? response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade] = {} : response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade];

                    aluno = itemAluno;

                    let arrayAlunos = [];
                    let notaIDD;
                    let notaSimuladoEnade;
                    let notaInfraestrutura;
                    let notaODP;
                    let notaAmpliacao;

                    if (response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"] != undefined) {
                        arrayAlunos = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["alunos"];

                        notaIDD = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["notaIDD"] + itemAluno.notaIDD;
                        notaSimuladoEnade = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["notaSimuladoEnade"] + (itemAluno.notaSimuladoEnade == undefined ? 0 : itemAluno.notaSimuladoEnade);
                        notaInfraestrutura = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["notaInfraestrutura"] + itemAluno.notaInfraestrutura;
                        notaODP = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["notaODP"] + itemAluno.notaODP;
                        notaAmpliacao = response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"]["notaAmpliacao"] + itemAluno.notaAmpliacao;
                    } else {
                        notaIDD = (itemAluno.notaIDD == undefined ? 0 : itemAluno.notaIDD);
                        notaSimuladoEnade = (itemAluno.notaSimuladoEnade == undefined ? 0 : itemAluno.notaSimuladoEnade);
                        notaInfraestrutura = (itemAluno.notaInfraestrutura == undefined ? 0 : itemAluno.notaInfraestrutura);
                        notaODP = (itemAluno.notaODP == undefined ? 0 : itemAluno.notaODP);
                        notaAmpliacao = (itemAluno.notaAmpliacao == undefined ? 0 : itemAluno.notaAmpliacao);
                    }

                    arrayAlunos.push(aluno);

                    response[curso.estado][curso.cidade][curso.regiao][curso.curso][curso.preco][itemAluno.semestre][curso.faculdade]["info"] = {
                        idCurso: curso._id,
                        alunos: arrayAlunos,
                        notaIDD: calcNota(notaIDD, arrayAlunos),
                        notaSimuladoEnade: calcNota(notaSimuladoEnade, arrayAlunos),
                        notaSimuladoEnadeEfetiva: calcEnade(calcNota(notaSimuladoEnade, arrayAlunos)),
                        notaInfraestrutura: calcNota(notaInfraestrutura, arrayAlunos),
                        notaODP: calcNota(notaODP, arrayAlunos),
                        notaAmpliacao: calcNota(notaAmpliacao, arrayAlunos),
                        cpcEfetivo: calcEnade(calcCPC(curso.mestres, curso.doutores, curso.dedicacao, calcNota(notaSimuladoEnade, arrayAlunos), calcNota(notaIDD, arrayAlunos), calcNota(notaODP, arrayAlunos), calcNota(notaInfraestrutura, arrayAlunos), calcNota(notaAmpliacao, arrayAlunos))),
                        cpc: calcCPC(curso.mestres, curso.doutores, curso.dedicacao, calcNota(notaSimuladoEnade, arrayAlunos), calcNota(notaIDD, arrayAlunos), calcNota(notaODP, arrayAlunos), calcNota(notaInfraestrutura, arrayAlunos), calcNota(notaAmpliacao, arrayAlunos))
                    }
                }
            }
        }

        let dataResponse = [];

        for (let estado of Object.keys(response)) {
            for (let cidade of Object.keys(response[estado])) {
                for (let regiao of Object.keys(response[estado][cidade])) {
                    for (let curso of Object.keys(response[estado][cidade][regiao])) {
                        for (let preco of Object.keys(response[estado][cidade][regiao][curso])) {


                            for (let semestre of Object.keys(response[estado][cidade][regiao][curso][preco])) {

                                let faculdades = [];

                                for (let faculdade of Object.keys(response[estado][cidade][regiao][curso][preco][semestre])) {
                                    faculdades.push({

                                        faculdade: faculdade,
                                        notaIDD: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaIDD"],
                                        notaSimuladoEnade: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaSimuladoEnade"],
                                        notaSimuladoEnadeEfetiva: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaSimuladoEnadeEfetiva"],
                                        notaInfraestrutura: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaInfraestrutura"],
                                        notaODP: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaODP"],
                                        notaAmpliacao: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["notaAmpliacao"],
                                        cpcEfetivo: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["cpcEfetivo"],
                                        cpc: response[estado][cidade][regiao][curso][preco][semestre][faculdade]["info"]["cpc"],
                                    })

                                }

                                dataResponse.push({
                                    estado: estado,
                                    cidade: cidade,
                                    regiao: regiao,
                                    curso: curso,
                                    preco: preco,
                                    semestre: semestre,
                                    faculdades: faculdades,
                                })
                            }
                        }
                    }
                }
            }

        }


        resolve(dataResponse);
    });
}

function calcNota(nota, arrayAlunos) {
    if (nota == undefined) nota = 0;
    return nota / (arrayAlunos.length == 0 ? 1 : arrayAlunos.length)
}

function calcCPC(mestres, doutores, dedicacao, enade, idd, odp, infra, ampliacao) {
    let notamestres = 0;
    let notadoutores = 0;
    let notadedicacao = 0;
    let notaSimuladoEnade = 0;
    let notaidd = 0;
    let notaodp = 0;
    let notainfra = 0;
    let notaampliacao = 0;

    notamestres = mestres * 0.075;
    notadoutores = doutores * 0.15;
    notadedicacao = dedicacao * 0.075;
    notaSimuladoEnade = enade * 0.2;
    notaidd = idd * 0.35;
    notaodp = odp * 0.075;
    notainfra = infra * 0.05;
    notaampliacao = ampliacao * 0.025;

    return notamestres + notadoutores + notadedicacao + notaSimuladoEnade + notaidd + notaodp + notainfra + notaampliacao;
}

function calcEnade(nota) {
    if (nota != undefined) {
        if (nota > 0.0 && nota <= 0.94) {
            return 1;
        } else if (nota > 0.95 && nota <= 1.94) {
            return 2;
        } else if (nota > 1.95 && nota <= 2.94) {
            return 3;
        } else if (nota > 2.95 && nota <= 3.94) {
            return 4;
        } else if (nota > 3.95) {
            return 5;
        }
    } else {
        return 1;
    }

}

app.use(express.static(__dirname + '/front/'));

var port = 3000;
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
