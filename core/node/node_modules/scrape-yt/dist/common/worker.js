"use strict";
/**
 * For worker thread
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var parser_1 = __importDefault(require("./parser"));
var data = worker_threads_1.workerData;
if (data.scraper === "search") {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(parser_1.default.parseSearch(data.html, data.options));
}
else if (data.scraper === "getPlaylist") {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(parser_1.default.parseGetPlaylist(data.html));
}
else if (data.scraper === "getVideo") {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(parser_1.default.parseGetVideo(data.html));
}
else if (data.scraper === "getRelated") {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(parser_1.default.parseGetRelated(data.html, data.options.limit));
}
else if (data.scraper === "getUpNext") {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(parser_1.default.parseGetUpNext(data.html));
}
