import * as vscode from "vscode";
import * as fs from "fs";

const _onDidMonitorConfiguration = new vscode.EventEmitter<string>();
let _watchFile: fs.FSWatcher = undefined;

function watchFile(): any {
	if (_watchFile) {
		_watchFile.close();
	}

	const filename = MonitorConfiguration.getServerFilename();
	if (fs.existsSync(filename)) {
		_watchFile = fs.watch(
			filename,
			{ encoding: "buffer" },
			(eventType, filename) => {
				if (filename && eventType === "change") {
					this._serversConfig = this.loadServersConfig();
					this.refresh();
				}
			}
		);
	}

	return _watchFile;
}

class MonitorConfiguration {

	static get onDidMonitorConfiguration(): vscode.Event<string> {
		return _onDidMonitorConfiguration.event;
	}

	static getServerFilename(): string {
		const options = MonitorConfiguration.getOptionsLocation();
		const location = MonitorConfiguration.getServerJsonLocation();
		const filename = options[location];

		return filename;
	}

	static getOptionsLocation(): any {
		const os = require("os");
		const path = require("path");
		const homedir = os.homedir();
		const serverFile = path.join(homedir, ".totvsls", "servers.json");
		const monitorFile = path.join(homedir, ".totvsls", "monitor.json");

		return { serverFile: serverFile, monitorFile: monitorFile };
	}

	static setServerJsonLocation(value: string) {
		const config = MonitorConfiguration.getTdsMonitor();
		const result = config.update("servers.json", value);

		if (result) {
			watchFile();
			_onDidMonitorConfiguration.fire();
		}

		return result;
	}

	static getServerJsonLocation(): string {
		const config = MonitorConfiguration.getTdsMonitor();

		return config.get("servers.json", "monitorFile");
	}

	static setShowWelcomePage(show: boolean) {
		const config = MonitorConfiguration.getTdsMonitor();
		const result = config.update("welcomePage", show);

		return result;
	}

	static getTdsMonitor(): vscode.WorkspaceConfiguration {

		return vscode.workspace.getConfiguration("tdsMonitor");
	}

	static isShowWelcomePage() {

		return MonitorConfiguration.getTdsMonitor().get("welcomePage", true);
	}

	static isReconnectLastServer(): boolean {

		return MonitorConfiguration.getTotvsLanguageServer().get("reconnectLastServer");
	}

	static getTotvsLanguageServer(): vscode.WorkspaceConfiguration {

		return vscode.workspace.getConfiguration("totvsLanguageServer");
	}
}

watchFile();

export default MonitorConfiguration;