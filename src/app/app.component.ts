import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { PuzzleResponse, DecryptedPuzzleResponse } from 'src/models/puzzle';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

type DisplayMode = 'menu' | 'words' | 'optionalWords';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    private secret = '8C5a9o2Z8zjmCLHB';
    private startDate = moment('2024-02-28T00:00:00');
    show = false;
    mode: DisplayMode = 'menu';
    words: string[] = [];
    optionalWords: string[] = [];

    constructor(private httpClient: HttpClient) {}

    async ngOnInit(): Promise<void> {
        const offset = moment().diff(this.startDate, 'days');
        const puzzleResponse = await firstValueFrom(
            this.httpClient.get<PuzzleResponse>(
                `https://squares.org/api/v1/basic/load-puzzles?offset=${offset}`,
            ),
        );
        const wordArray = CryptoJS.AES.decrypt(puzzleResponse.puzzles, this.secret);
        const decrypted = CryptoJS.enc.Utf8.stringify(wordArray);
        const decryptedPuzzleResponse = JSON.parse(
            decrypted,
        ) as DecryptedPuzzleResponse[];
        const puzzle = decryptedPuzzleResponse.reduce((acc, next) =>
            next.id > acc.id ? next : acc,
        );
        this.words = puzzle.words;
        this.optionalWords = puzzle.optionalWords;
    }
}
