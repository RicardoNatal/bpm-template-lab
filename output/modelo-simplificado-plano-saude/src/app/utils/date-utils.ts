import {
  parse,
  isValid,
  lightFormat,
  intervalToDuration,
  Duration,
  Interval,
  startOfDay,
} from 'date-fns';

export class DateUtils {
  static FORMATO_DATA_BRASIL = 'dd/MM/yyyy';
  static FORMATO_DATA_ISO = 'yyyy-MM-dd';
  static FORMATO_HORAS_MINUTOS = 'HH:mm';
  static DATA_ZERO_G5 = new Date(1900, 11, 31, 0, 0, 0, 0);
  static DATA_MAXIMA_G5 = new Date(2079, 11, 31, 0, 0, 0, 0);

  static parseDataG5(dataG5: string): Date | null  {
    const dataParseada = parse(dataG5, this.FORMATO_DATA_BRASIL, new Date());
    const dataValida = isValid(dataParseada);
    return dataValida ? dataParseada : null;
  };

  static parseDataPlataforma(data: string): Date | null {
    const dataParseada = parse(data, this.FORMATO_DATA_ISO, new Date());
    const dataValida = isValid(dataParseada);
    return dataValida ? dataParseada : null;
  };

  static dataHoraParaMinutos(data: Date): number | null {
    const dataValida = isValid(data);
    return dataValida ? data.getHours() * 60 + data.getMinutes() : null;
  };

  static minutosParaDataHora(minutos = 0): Date {
    const minutes = minutos % 60;
    const hours = Math.floor(minutos / 60);
    const dataEHora = new Date();
    dataEHora.setHours(hours, minutes, 0, 0);
    return dataEHora;
  };

  static formataDataG5(data: Date): string | null {
    return isValid(data) ? lightFormat(data, this.FORMATO_DATA_BRASIL) : null;
  };

  static formataDataPlataforma(data: Date): string | null {
    return isValid(data) ? lightFormat(data, this.FORMATO_DATA_ISO) : null;
  };

  static formataMinutosParaHorasMinutos(minutos = 0): string {
    const minutes = minutos % 60;
    const hours = Math.floor(minutos / 60);
    return `${this.completar2Digitos(hours)}:${this.completar2Digitos(minutes)}`;
  };

  static formataDataParaHorasMinutos(data: Date): string | null {
    return isValid(data) ? lightFormat(data, DateUtils.FORMATO_HORAS_MINUTOS) : null;
  };

  static parseListaDataG5(dataG5: string[]): Date[] {
    return dataG5
      .map((dataString) => this.parseDataG5(dataString))
      .filter((data) => data != null) as Date[];
  };

  static intervaloAteHoje(data: Date): Duration {
    const dataValida = isValid(data);

    if (dataValida) {
      const dataHoje = startOfDay(new Date());
      const intervalo: Interval = { start: dataHoje, end: data };
      return intervalToDuration(intervalo);
    }

    return {
      days: 0,
      hours: 0,
      minutes: 0,
      months: 0,
      seconds: 0,
      weeks: 0,
      years: 0,
    };
  };

  static completar2Digitos(num: number): string {
    return num.toString().padStart(2, '0');
  };

  static dataParaTexto(data: string | Date): string | null{
    if(typeof(data) != "string"){
      return this.formataDataG5(data)
    }else{
      return data
    }
  }

  static textoParaData(data: string | Date): Date | null{
    if(typeof(data) == "string"){
      return this.parseDataPlataforma(data)
    }else{
      return data
    }
  }  
}

