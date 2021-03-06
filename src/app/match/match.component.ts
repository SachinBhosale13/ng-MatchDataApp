import { Component, OnInit, ViewChild, ElementRef,NgModule } from '@angular/core';
import { MatDialog } from '@angular/material';
import {AddPlayerDialogComponent} from '../add-player-dialog/add-player-dialog.component';
import {FormControl,FormGroup,Validators} from '@angular/forms';
import {PlayerDataService} from '../services/player-data.service'
import { stringify } from 'querystring';
import {CustomValidators} from '../Shared/validator';
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';
import {Match} from '../Shared/Match';
import { ApiResponseDialogComponent } from '../api-response-dialog/api-response-dialog.component';
import { error } from 'util';
import {Country} from '../Shared/Country';

@Component({
  selector: 'Match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  public matchForm :FormGroup;
  public matchData:Match;  
  public allowSubmit:boolean=false;
  public indx:number;
  //public teams:string[]=['Afghanistan','Australia','Bangladesh','England','India','Ireland','New Zealand','Pakistan','South Africa','Sri Lanka','West Indies','Zimbabwe'];
  public teamsArr:string[]=[];
  // public countries:Country[];
  public t1Indx:number;
  public t2Indx:number; 
  public disableTeamOne :boolean= false;
  public disableTeamTwo :boolean= false;
  
  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
        bodyBackgroundColor: '#424242', //#424242
        buttonColor: '#fff'
    },
    dial: {
        dialBackgroundColor: '#555',
    },
    clockFace: {
        clockFaceBackgroundColor: '#555',
        clockHandColor: '#c2175b', //#9fbd90
        clockFaceTimeInactiveColor: '#fff'
    }
  }; 



  constructor(public dialog:MatDialog,public playerService:PlayerDataService) {
    this.teamsArr = this.playerService.teamsArr;
  }
  
  minDate = new Date();  

  ngOnInit() 
  {
    // this.playerService.GetCountries().subscribe(result=> {
    //   //console.log("Countries: " + JSON.stringify(result)),
    //   this.countries = result;
    //   console.log("this.countries: " + JSON.stringify(this.countries));
    // });

    this.matchForm = new FormGroup({
        matchName:new FormControl('',[Validators.required,Validators.minLength(2),Validators.maxLength(50)]),
        matchDate:new FormControl('',[Validators.required]),
        teamOne:new FormControl('',[Validators.required,Validators.minLength(2),Validators.maxLength(25),CustomValidators.alphabetOnly]),
        teamTwo:new FormControl('',[Validators.required,Validators.minLength(2),Validators.maxLength(25),CustomValidators.alphabetOnly]),
        startTime:new FormControl('',[Validators.required]),
        mAddress:new FormControl('',[Validators.required,Validators.minLength(5),Validators.maxLength(70)])
    });
    this.playerService.obsTeamPlayersNo.subscribe(result=>{
      //console.log(result);
      if(result[0] > 0 && result[1] > 0 && result[0] <= 11 && result[1] <= 11 && result[0] == result[1])      {
        this.allowSubmit = true;
      }
      else      {
        this.allowSubmit = false;
      }
      if(result[0] > 0)      {
        this.disableTeamOne = true;
      }
      else      {
        this.disableTeamOne = false;
      }
      if(result[1] > 0)      {
        this.disableTeamTwo = true;
      }
      else      {
        this.disableTeamTwo = false;
      }
    });
  }

  // ngAfterContentChecked()
  // {
  //   if(this.playerService.noOfPlayers == 2)
  //   {
  //     this.allowSubmit = true;
  //   }
  // }

  public hasError = (controlName: string,errorName: string)=>
  {    
    return this.matchForm.controls[controlName].hasError(errorName);
  }

  onTeamChanged(id:string,value:string)
  {    
    //console.log(id+":"+value);

    if(id == 'teamOne')
    {
      this.t1Indx = this.teamsArr.indexOf(value);      
      //console.log("t1 Index:"+this.t1Indx);
    }
    else if(id == 'teamTwo')
    {
      this.t2Indx = this.teamsArr.indexOf(value);      
      //console.log("t2 Index:"+this.t2Indx);
    }
  }

  ClockIcon_Click()
  {
    let element : HTMLElement = document.getElementsByClassName('clStartTime')[0] as HTMLElement;
    //console.log(element);
    element.click();
  }

  addPlayer()
  {
    // console.log("TeamOne: "+this.matchForm.controls['teamOne'].value);
    // console.log("TeamTwo: "+this.matchForm.controls['teamTwo'].value);

    let t1Val = this.matchForm.controls['teamOne'].value;
    let t2Val = this.matchForm.controls['teamTwo'].value;  
    
    this.playerService.PushSelectedTeams(t1Val,t2Val);
    
    
    this.dialog.open(AddPlayerDialogComponent,{height:'69%',width:'30%'});
  }


  public submitMatchDetails()
  {
    let dt=new Date(this.matchForm.get('matchDate').value);    
    let mo = dt.getMonth() + 1;
    let mDate= dt.getDate() + "/" + mo + "/" + dt.getFullYear();    
    let sTime :number;
    let startTime:string;
    let sTimeArr = this.matchForm.get('startTime').value.split(' ',2);    
    let sTimeAmPm = sTimeArr[1];    

    let sTimeHrs = parseInt(sTimeArr[0].split(':',2)[0]);    

    if(sTimeAmPm == "AM")
    {
      sTime = parseInt(sTimeArr[0]);
    }
    else if(sTimeAmPm == "PM")
    {
      sTime = parseInt(sTimeArr[0])+12;
    }
    
    startTime = sTime + ":" + sTimeArr[0].split(':',2)[1];
    

    this.matchData =
    {
      matchName : this.matchForm.get('matchName').value,
      matchDate:mDate,
      teamOne : this.matchForm.get('teamOne').value,
      teamTwo : this.matchForm.get('teamTwo').value,
      startTime : startTime,
      mAddress : this.matchForm.get('mAddress').value
    }
    
    this.playerService.SubmitMatchDetails(this.matchData).subscribe(
      res=> {
      //this.playerService.UpdateResponseData(res),
      console.log("Response in subscribe: "+JSON.stringify(res));
      this.dialog.open(ApiResponseDialogComponent,{data:{res},height:'35%',width:'32%'})
      },
      error=>{
        console.log("Internal server error:" + error);
        this.dialog.open(ApiResponseDialogComponent,{data:error,height:'35%',width:'32%'})
      }
      );
  }
}

