import { Component, OnInit } from '@angular/core';
import { InfoProvider } from 'src/services/info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [InfoProvider]
})
export class AppComponent implements OnInit{
  title = 'queroPlay';

  info: any;

  constructor(
    public infoProvider: InfoProvider,
  ) {}

  public ngOnInit() {
    this.infoProvider.getinfos()
    .subscribe(res => {
      this.info = res;
      console.log(this.info);
    })
  }
  

}
