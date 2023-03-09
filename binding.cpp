#include <napi.h>
#include <chrono>
#include <thread>

using namespace Napi;

class EchoWorker : public AsyncProgressQueueWorker<uint32_t> {
 public:
  EchoWorker(Function& okCallback,
             Function& progressCallback,
             std::string& echo)
      : AsyncProgressQueueWorker(okCallback), echo(echo) {
    this->progressCallback.Reset(progressCallback, 1);
  }

  void Execute(const ExecutionProgress& progress) {
    for (uint32_t i = 0; i < 6; ++i) {
      std::this_thread::sleep_for(std::chrono::milliseconds(500));
      progress.Send(&i, 1);
    }
  }

  void OnProgress(const uint32_t* data, size_t /* count */) {
    HandleScope scope(Env());

    if (!this->progressCallback.IsEmpty()) {
      this->progressCallback.Call(Receiver().Value(),
                                  {Number::New(Env(), *data)});
    }
  }

  void OnOK() {
    HandleScope scope(Env());
    Callback().Call(Receiver().Value(),
                    {Env().Null(), String::New(Env(), echo)});
  }

  void OnError(const Error& e) {
    HandleScope scope(Env());
    Callback().Call(Receiver().Value(), {e.Value()});
  }

 private:
  std::string echo;
  FunctionReference progressCallback;
};

Value Echo(const CallbackInfo& info) {
  std::string in = info[0].As<String>();
  Function okCb = info[1].As<Function>();
  Function progressCb = info[2].As<Function>();
  EchoWorker* wk = new EchoWorker(okCb, progressCb, in);
  wk->Queue();
  return info.Env().Undefined();
}

Object Init(Env env, Object exports) {
  exports.Set(String::New(env, "echo"), Function::New(env, Echo));
  return exports;
}

NODE_API_MODULE(nativeAddon, Init)
