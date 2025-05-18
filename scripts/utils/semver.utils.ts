export function isSemver(v: string): boolean {
  return /^v\\d+\\.\\d+\\.\\d+$/.test(v);
}

export function semverCompare(a: string, b: string): number {
  const pa = a.slice(1).split('.').map(Number);
  const pb = b.slice(1).split('.').map(Number);
  return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
}

export function pushAndSortVersions(
  versions: string[],
  newVersion: string
): string[] {
  // Add the new version to the array
  versions.push(newVersion);

  // Remove duplicates by converting the array to a Set and back to an array
  const uniqueVersions = Array.from(new Set(versions));

  // Sort the versions using a custom comparator for semantic versioning
  uniqueVersions.sort((a, b) => {
    const [majorA, minorA, patchA] = a.split('.').map(Number);
    const [majorB, minorB, patchB] = b.split('.').map(Number);

    if (majorA !== majorB) {
      return majorA - majorB;
    }
    if (minorA !== minorB) {
      return minorA - minorB;
    }
    return patchA - patchB;
  });

  return uniqueVersions;
}

type RefObject = { version: string; url: string };

export function pushAndSortRefObjects(
  refObjects: RefObject[],
  newVersionObject: RefObject
): RefObject[] {
  // Add the new version object to the array
  refObjects.push(newVersionObject);

  // Remove duplicates by converting the array to a Map and back to an array
  const uniqueRefObjects = Array.from(
    new Map(refObjects.map((v) => [v.version, v])).values()
  );

  // Sort the version objects using a custom comparator for semantic versioning
  uniqueRefObjects.sort((a, b) => {
    const [majorA, minorA, patchA] = a.version.split('.').map(Number);
    const [majorB, minorB, patchB] = b.version.split('.').map(Number);

    if (majorA !== majorB) {
      return majorA - majorB;
    }
    if (minorA !== minorB) {
      return minorA - minorB;
    }
    return patchA - patchB;
  });

  return uniqueRefObjects;
}
