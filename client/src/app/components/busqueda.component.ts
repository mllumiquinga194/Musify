import { Component, OnInit } from '@angular/core';
import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { Song } from '../models/song';
import { AlbumService } from '../services/album.service';
import { SongService } from '../services/song.service';


@Component({
    selector: 'busqueda',
    templateUrl: '../views/busqueda.html',
    providers: [
        UserService,
        AlbumService,
        SongService
    ]
})

export class BusquedaComponent implements OnInit {
    public titulo: string;
    public songs: Song;
    public searching: boolean = false;
    public identity;
    public token;
    public url: string;
    public alertMessage;
    public song: any = [];
    public confirmado;


    constructor(
        private _userService: UserService,
        private _songService: SongService,
    ) {
        this.titulo = 'Busqueda';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
    }

    ngOnInit() {
        console.log('Busqueda.component.ts cargado');
        this.getSongs();//para llamar al album y mostrar su nombre al momento de cargar una nueva cancion

    }

    getSongs() {
        this._songService.getSongs(this.token, null).subscribe(
            response => {
                if (!response.songs) {
                } else {
                    this.songs = response.songs;
                    for (var i in response.songs) {
                        this.song.push(response.songs[i].name);
                    }
                    console.log(this.songs);

                }
            },
            error => {
                //cuando recibimos un error, lo recibimos diferente a cuando recibimos un status200 que es un json usable. en este caso vamos a parsear a json el error para poder usar correctamente el mensaje del error y mostrarlo en la alerta
                var errorMessage = <any>error;

                if (errorMessage != null) {
                    var body = JSON.parse(error._body);

                    this.alertMessage = body.message;
                    console.log(error);
                }
            }
        );
    }

    public showSearchResults(event: any): void {
        if (event.target.value.length >= 3) {
            this.searching = true;
        } else {
            this.searching = false;
        }
    }

    onDeleteConfirm(id) {
        this.confirmado = id;
    }

    onCancelSong() {
        this.confirmado = null;
    }

    onDeleteSong(id) {
        this._songService.deleteSong(this.token, id).subscribe(
            response => {

                if (!response.song) {
                    alert('Error en el servidor')
                }
                this.getSongs();
            },
            error => {
                //cuando recibimos un error, lo recibimos diferente a cuando recibimos un status200 que es un json usable. en este caso vamos a parsear a json el error para poder usar correctamente el mensaje del error y mostrarlo en la alerta
                var errorMessage = <any>error;

                if (errorMessage != null) {
                    var body = JSON.parse(error._body);

                    //this.alertMessage = body.message;
                    console.log(error);
                }
            }
        )
    }

    startPlayer(song) {
        let song_player = JSON.stringify(song);//convertir el objeto que nos llega a un string de JSON para luego guardarla en el localstorage
        let file_path = this.url + 'get-song-file/' + song.file;//guardo la ruta de esa cancion para hacer que persista
        let image_path = this.url + 'get-image-album/' + song.album.image;//guardo la imagen del album de esa cancion para hacer que persista

        localStorage.setItem('sound_song', song_player);//para guardar la cancion que esta sonando
        document.getElementById("mp3-source").setAttribute("src", file_path);//para cambiar los valores que tiene le reproductor

        (document.getElementById("player") as any).load();//para cargar la cancion en el player.
        (document.getElementById("player") as any).play();//y la reproducimos

        document.getElementById('play-song-title').innerHTML = song.name;
        document.getElementById('play-song-artist').innerHTML = song.album.artist.name;
        document.getElementById('play-image-album').setAttribute('src', image_path);
        document.getElementById('repro').innerHTML = 'Reproduciendo';
    }

}