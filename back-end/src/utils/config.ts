

export interface Config { 
  nomeCliente: string;
  ip: string;
  user: string;
  password: string;
  localCSV: string;
  metodoCSV: string;
  habilitarCSV: boolean;
  serverDB: string;
  database: string;
  userDB: string;
  passwordDB: string;
  mySqlDir: string;
  dumpDir: string;
  batchDumpDir: string;
}

export default {
	nomeCliente: "",
	ip: "",
	user: "",
	password: "",
	localCSV: "",
	metodoCSV: "", // '1' ou '2'
	habilitarCSV: false,
	serverDB: "",
	database: "",
	userDB: "",
	passwordDB: "",
	mySqlDir: "",
	dumpDir: "",
	batchDumpDir: "",
};