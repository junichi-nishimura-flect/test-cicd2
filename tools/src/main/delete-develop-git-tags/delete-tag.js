const git = require("simple-git")();
const TimeUtils = require("./time-utils");

(async () => {
  // 1. git tagの一覧を取得する
  const tagsRow = await git.raw([
    "for-each-ref",
    "--sort=-taggerdate",
    "--format='%(taggerdate:iso) %(objectname) %(tag) %(taggername)'",
    "refs/tags",
  ]);

  // 2. コマンドの結果をパースする
  const tags = tagsRow
    .split("\n")
    .filter((e) => {
      // 空行は除去
      return e !== "";
    })
    .map((e) => {
      // 前後のコーテ−ション除去
      const line = e.substring(1).slice(0, -1);
      // 先頭から25文字は日付データ ※例 2024-11-19 13:32:26 +0900
      const timeElems = line.substring(0, 25).split(" ");
      // 2つ目以降の要素を分割 ※ 1つ目の要素 26文字は除外
      const columns = line.substring(26).split(" ");

      return {
        time: TimeUtils.utc2JstDay(
          `${timeElems[0]} ${timeElems[1]}${timeElems[2]}`
        ),
        hash: columns[0], // 2つ目の要素はコミットハッシュ
        tag: columns[1], // 3つ目の要素はタグ
        user: columns[2], // 4つ目の要素はタグを作成したユーザ
      };
    });

  // 3. タグの一覧をログ出力
  console.log(`----- 現時点のタグの一覧 (${TimeUtils.formatCurrent()}) -----`);
  for (const tag of tags) {
    console.log(
      `${tag.time.format("YYYY-MM-DD HH:mm:ssZ")} ${tag.hash} ${tag.tag} ${
        tag.user
      }`
    );
  }

  // 4. git tagの一覧から対象のtagを抽出する
  const threshold = TimeUtils.daysAgo(3);
  const tags4Delete = tags.filter((tag) => {
    // N日前に作成されたタグ
    if (TimeUtils.isSameOrBefore(tag.time, threshold)) {
      // タグの形式が「dev-release-[keycloak|batch|cdk]-yyyy-mm-dd-99」
      const regex =
        /dev-release-(keycloak|batch|cdk)-20[0-9][0-9]-[01][0-9]-[0-3][0-9]-[0-9]+/g;
      if (tag.tag.match(regex)) {
        return true;
      }
    }
    return false;
  });

  // 5. タグを削除する
  console.log(`----- 削除対象のタグ (${TimeUtils.formatCurrent()}) -----`);

  for (const tag of tags4Delete) {
    // ログに出力
    console.log(
      `${tag.time.format("YYYY-MM-DD HH:mm:ssZ")} ${tag.hash} ${tag.tag} ${
        tag.user
      }`
    );
    // タグ削除コマンドの実行
    const result = await git.push(["origin", "--delete", tag.tag]);
  }
})();
