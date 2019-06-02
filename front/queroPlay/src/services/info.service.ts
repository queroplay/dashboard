import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class InfoProvider {

    constructor(public http: HttpClient) { }

    private headers = new HttpHeaders().set('Content-Type', 'application/json');
    private infoURL =  'http://localhost:3000/info/';

    getinfos(): Observable<Object> {
        return this.http.get(this.infoURL)
            .pipe(
                (res => res)
            );
    }
}