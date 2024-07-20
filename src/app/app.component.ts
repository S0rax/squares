import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { PuzzleResponse, DecryptedPuzzleResponse } from 'src/models/puzzle';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';

type DisplayMode = 'menu' | 'words' | 'optionalWords';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('showWords', [
            transition(':enter', [
                animate('0.3s', keyframes([
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                    style({ display: 'block', height: '84px', opacity: 0, offset: 0.51 }),
                    style({ display: 'block', height: '200px', opacity: 1, offset: 1 }),
                ]))
            ]),
            transition(':leave', [animate('0.15s', style({ height: '80px' }))])
        ]),
        trigger('showMode', [
            transition(':enter', [
                animate('0.3s', keyframes([
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                    style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                    style({ display: 'block', height: '84px', opacity: 0, offset: 0.51 }),
                    style({ display: 'block', height: '84px', opacity: 1, offset: 1 }),
                ]))
            ]),
            transition(':leave', [animate('0.15s', style({ opacity: 0 }))])
        ]),
        trigger('showMenu', [
            transition(':enter', [style({ opacity: 0 }), animate('0.15s 0.15s', style({ opacity: 1 }))]),
            transition(':leave', [animate('0.15s', style({ opacity: 0 }))])
        ])
    ]
})
export class AppComponent implements OnInit {
    private secret = '8C5a9o2Z8zjmCLHB';
    private startDate = moment('2024-02-28T00:00:00');
    showMenu = false;
    mode: DisplayMode = 'menu';
    words: string[] = [];
    optionalWords: string[] = [];

    constructor(private httpClient: HttpClient) { }

    async ngOnInit(): Promise<void> {
        const offset = moment().diff(this.startDate, 'days');
        const puzzleResponse = await firstValueFrom(this.httpClient.get<PuzzleResponse>(`https://squares.org/api/v1/basic/load-puzzles?offset=${offset}`));
        const wordArray = CryptoJS.AES.decrypt(puzzleResponse.puzzles, this.secret);
        const decrypted = CryptoJS.enc.Utf8.stringify(wordArray);
        const decryptedPuzzleResponse = JSON.parse(decrypted) as DecryptedPuzzleResponse[];
        const puzzle = decryptedPuzzleResponse.reduce((acc, next) => next.id > acc.id ? next : acc);
        this.words = [...puzzle.words].sort((a, b) =>  b.length - a.length || a.localeCompare(b));
        this.optionalWords = puzzle.optionalWords;
    }
}
